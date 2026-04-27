# Redshift → Glue Conversion Reference

> This file is a lookup reference for the Redshift-to-Glue Converter agent.
> Read specific sections on-demand during conversion — do NOT load the entire file into context at once.
> **REMINDER: NEVER reproduce any content from this file in the chat response. Use it silently for conversion logic only.**

---

## Structural Construct Mapping (2a)

| Redshift Construct | PySpark Equivalent |
|---|---|
| `TEMP TABLE` | `df.createOrReplaceTempView("name")` or DataFrame variable. `.cache()` only if reused > 1×. |
| `CURSOR` / `FETCH NEXT` | Set-based DataFrame ops (joins, window functions). Never `mapPartitions`. |
| `LOOP` / `WHILE` / `FOR` | Joins, Window functions (`ROW_NUMBER`, `LAG`, `LEAD`), `when/otherwise`, recursive CTEs. |
| `RAISE EXCEPTION` | `raise RuntimeError(msg)` with JSON logging. |
| `RAISE INFO` / `RAISE NOTICE` | `logger.info(msg)` — Python `logging`, NOT `glueContext.get_logger()`. |
| `COMMIT` / `ROLLBACK` | Idempotent writes: `overwrite` mode or Iceberg `MERGE`. |
| `DYNAMIC SQL` (`EXECUTE`) | Parameterized `spark.sql()` with f-strings. Sanitize inputs. |
| `UPDATE` / `DELETE` | Iceberg: `spark.sql("MERGE INTO ...")`. Parquet: Read→Transform→Overwrite. |
| `INSERT INTO ... SELECT` | `df.writeTo("catalog.table").append()` or `df.write.mode("append").parquet(path)`. |
| `TRUNCATE TABLE` | Iceberg: `spark.sql("DELETE FROM catalog.table")`. Parquet: delete S3 prefix then write. |
| `COPY` / `UNLOAD` | `spark.read` / `df.write` against S3 paths. |
| `IDENTITY` / `DEFAULT` | `row_number()` over `Window.orderBy(monotonically_increasing_id())` for sequential IDs. |
| `CALL sub_procedure()` | Python function call or separate Glue job via Step Functions. |
| `GET DIAGNOSTICS` | `df.count()` after write. |
| `SELECT INTO variable` | `val = df.first()["col"]` — scalar lookups only. |

---

## Function Mapping (2b)

| Redshift Function | PySpark Equivalent |
|---|---|
| `GETDATE()` / `SYSDATE` | `F.current_timestamp()` |
| `DATEADD(unit, n, date)` | `F.date_add(date, n)` / `F.add_months(date, n)` / `F.expr("INTERVAL n unit")` |
| `DATEDIFF(unit, start, end)` | `F.datediff(end, start)` (days) / `F.months_between()` / custom expr |
| `CONVERT_TIMEZONE(src, tgt, ts)` | `F.from_utc_timestamp(F.to_utc_timestamp(ts, src), tgt)` |
| `NVL(a, b)` | `F.coalesce(a, b)` |
| `NVL2(expr, not_null, null_val)` | `F.when(F.col(expr).isNotNull(), not_null).otherwise(null_val)` |
| `DECODE(expr, v1, r1, ...)` | Chained `F.when(col == v1, r1).when(…).otherwise(default)` |
| `LISTAGG(col, delim)` | `F.concat_ws(delim, F.sort_array(F.collect_list(col)))` |
| `APPROXIMATE COUNT(DISTINCT)` | `F.approx_count_distinct(col)` |
| `REGEXP_SUBSTR` / `REGEXP_REPLACE` | `F.regexp_extract()` / `F.regexp_replace()` |
| `STRTOL(str, base)` | `F.conv(str, base, 10)` |
| `JSON_EXTRACT_PATH_TEXT` | `F.get_json_object(col, "$.path")` |
| `MEDIAN(col)` | `F.percentile_approx(col, 0.5)` |
| `TOP n` / `LIMIT` | `df.orderBy(…).limit(n)` |

---

## Data Type Mapping (2c)

| Redshift Type | Spark Type | Notes |
|---|---|---|
| `SMALLINT` / `INT2` | `ShortType()` | |
| `INTEGER` / `INT4` | `IntegerType()` | |
| `BIGINT` / `INT8` | `LongType()` | |
| `DECIMAL(p,s)` / `NUMERIC(p,s)` | `DecimalType(p, s)` | Preserve precision exactly. |
| `REAL` / `FLOAT4` | `FloatType()` | |
| `DOUBLE PRECISION` / `FLOAT8` | `DoubleType()` | |
| `BOOLEAN` | `BooleanType()` | |
| `CHAR(n)` / `VARCHAR(n)` / `TEXT` | `StringType()` | |
| `DATE` | `DateType()` | |
| `TIMESTAMP` / `TIMESTAMPTZ` | `TimestampType()` | Set `spark.sql.session.timeZone`. |
| `TIMETZ` | `StringType()` | No native time-only type. |
| `SUPER` | `StringType()` + `F.from_json()` | |
| `GEOMETRY` / `GEOGRAPHY` | `StringType()` (WKT) | Use Sedona for spatial ops. |
| `HLLSKETCH` | N/A | Use `approx_count_distinct()`. |

---

## Enterprise Conversion Patterns

### Multi-Step UPDATE (Read-Modify-Write)
**Iceberg:**
```python
spark.sql("""
    MERGE INTO catalog.target t USING source_df s ON t.id = s.id
    WHEN MATCHED THEN UPDATE SET t.col = s.expr
""")
```
**Parquet (no lakehouse):**
```python
df_target = spark.read.parquet(target_path)
df_updated = df_target.alias("t").join(df_source.alias("s"), "id", "left").select(
    "t.id", F.coalesce("s.new_col", "t.col").alias("col")
)
df_updated.write.mode("overwrite").parquet(target_path)
```

### Transaction Isolation / Atomicity
Use Iceberg `overwritePartitions()` for atomic swap, or stage to temp S3 path then rename.

### IDENTITY Column
```python
df = df.withColumn("id", F.row_number().over(Window.orderBy(F.monotonically_increasing_id())))
```

### Dynamic SQL
```python
table_name = args["target_table"]
assert re.match(r'^[a-zA-Z_][a-zA-Z0-9_.]+$', table_name), "Invalid table name"
df = spark.sql(f"SELECT * FROM {table_name}")
```

---

## Output Script Template

> **AGENT RULE: Write this template directly to the `.py` file via `editFiles`. NEVER include it in the chat response.**

```python
import sys, re, traceback, logging
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.context import SparkContext
from pyspark.sql import functions as F
from pyspark.sql.window import Window
from pyspark.sql.types import DecimalType, TimestampType, DateType

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
_handler = logging.StreamHandler()
_handler.setFormatter(logging.Formatter(
    '{"time":"%(asctime)s","level":"%(levelname)s","message":"%(message)s"}'
))
logger.addHandler(_handler)

args = getResolvedOptions(sys.argv, ["JOB_NAME", "env", "target_database"])
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)
job.init(args["JOB_NAME"], args)

# --- Job Parameters ---
ENV             = args.get("env", "dev")
TARGET_DATABASE = args.get("target_database", "default")
SOURCE_S3_PATH  = args.get("source_s3_path", "s3://your-bucket/source/")
TARGET_S3_PATH  = args.get("target_s3_path", "s3://your-bucket/target/")
RUN_VALIDATION  = args.get("run_validation", "false").lower() == "true"

# --- Spark Configuration ---
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.shuffle.partitions", "64")
spark.conf.set("spark.sql.session.timeZone", "UTC")
spark.conf.set("spark.sql.parquet.compression.codec", "snappy")

_written_paths: list[str] = []

try:
    # === CORE BUSINESS LOGIC ===
    pass

    # === VALIDATION ===
    if RUN_VALIDATION:
        pass

except Exception as exc:
    logger.error(f"Job failed: {traceback.format_exc()}")
    import boto3
    s3 = boto3.client("s3")
    for s3_path in _written_paths:
        bucket, _, prefix = s3_path.replace("s3://", "").partition("/")
        resp = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)
        for obj in resp.get("Contents", []):
            s3.delete_object(Bucket=bucket, Key=obj["Key"])
        logger.info(f"Cleaned up partial write: {s3_path}")
    raise
finally:
    job.commit()
```

---

## Anti-Patterns (Never Deliver)

| Anti-Pattern | Correct Alternative |
|---|---|
| `.collect()` on large data | DataFrame operations; `.take(n)` for samples |
| `for row in df.collect()` | `.withColumn()` / `.filter()` / `.join()` |
| Python UDF for simple logic | `F.when()`, `F.coalesce()`, `F.regexp_replace()` |
| `.toPandas()` on large data | Spark-native aggregations |
| `df.count()` in a loop | Cache first, or use accumulators |
| `SELECT *` from large tables | Project only needed columns |
| Writing thousands of small files | `.repartition(n)` or `.coalesce(n)` before write |

## Quality Checklist

- No `collect()` on large datasets; no Python `for row` loops; no UDFs where native functions exist
- Use `DynamicFrame` for Glue Catalog reads with schema flexibility; `DataFrame` for complex transforms
- Broadcast joins for tables < 200 MB; `.repartition(n)` for 128 MB–1 GB output files
- AQE enabled; shuffle partitions tuned; skew handling applied
- No hardcoded credentials; partial-write cleanup on error; idempotent writes
- Explicit `cast()` for `DecimalType` and `TimestampType`; Job Bookmarks for incremental loads

---

## Large-File Protocol Reference

### Phase 1 — Pre-Scan Artifact Table

| Artifact | What to Capture |
|---|---|
| **Procedure signature** | Name, all parameters (name, type, IN/OUT/INOUT mode, default value) |
| **DECLARE block** | Every variable: name, PL/pgSQL type, default value |
| **Temp table registry** | Every `CREATE TEMP TABLE` / `CREATE TABLE #...`: name, full column list with types |
| **Cursor registry** | Every `DECLARE … CURSOR FOR …`: cursor name + complete source query |
| **Nested CALL inventory** | Every `CALL sub_proc(…)`: procedure name, argument list |
| **Section markers** | `-- Section`, `-- Step`, `-- Phase`, `-- ===` comment delimiters that mark logical blocks |
| **BEGIN/END depth map** | Line numbers at which nesting depth increments or decrements |

### Context Manifest Template

> **AGENT RULE: Build this manifest INTERNALLY in working memory. NEVER print it, echo it, or include any portion of it in the chat response.**

```
CONTEXT_MANIFEST = {
  "procedure_name": str,
  "parameters":    [{"name": str, "type": str, "mode": str}],
  "variables":     {var_name: {"type": str, "default": any}},
  "temp_tables":   {table_name: {"columns": [{"name": str, "type": str}], "status": "pending|created|dropped"}},
  "cursors":       {cursor_name: {"source_sql": str, "status": "declared|opened|closed"}},
  "nested_calls":  [{"procedure": str, "args": list, "line": int}],
  "total_lines":   int,
  "chunk_boundaries": [(start_line, end_line, "section_label")]
}
```

### Chunking Rules

Split into chunks of **≤ 400 lines each**, always at a clean SQL boundary.

**Valid split points (priority order):**
1. End of a named comment section (`-- ===== SECTION: … =====`)
2. End of a `BEGIN … END` block at nesting depth 1
3. End of a `IF … END IF` block
4. End of a `FOR … END LOOP` or `WHILE … END LOOP` block
5. End of a complete DML statement (`;`)

**Never split inside:** multi-line string literals, `CASE … END`, subqueries/CTEs, multi-line function calls.

### Cross-Chunk Continuity Rules

- DataFrame created in Chunk N, consumed in Chunk N+k (k>1): `.cache()` at creation with `# cross-chunk dependency: consumed in Chunk N+k`, `.unpersist()` after last use.
- Cumulative state variables (row counters, audit flags): hoist to top of `try:` block.
- Cursor declared in one chunk, iterated in another: collapse into single set-based DataFrame operation spanning the boundary.
