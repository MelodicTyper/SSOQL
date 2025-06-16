# SSOQL - Super Simple Object Query Language

What if there was SQL for interacting with Javascript objects organized into a table? Introducing SSOQL, a simple language for querying javascript objects that's inspired by SQL's syntax. Designed to have AI interact with a dataset without having it directly generating code. 

What SSOQL is not:
- Not a high performance or optimized library meant for databases
- Not a database at all - there's no inserting data.

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)

## Documentation

After importing the library, you can create queries by using ssoql.createQuery(query) with the type of ssoqlQuery. This does not run the query yet. You can see the object imports via ssoqlQuery.expectedObjects(), which returns the expected keys of the objects. You can run the query and get the return by running ssoqlQuery.execute(). Each keyword in the query language runs a javascript function on the current context.

## Examples for 12sAI
1. In Week 1 versus the Broncos, did the Seahawks give up more yards per play when Jarren Reed was on the field or when Dre'Mont Jones was on the field?
```sql
USE y2024.w1.D.[plays, yards, dPlayers]

QUERY reedYPP
SELECT yards WHERE (dPlayers CONTAINS 90)
$reedYards SUM
$reedPlays COUNT SELECT plays WHERE (dPlayers CONTAINS 90)
DIVIDE $reedYards $reedPLays
RETURN

QUERY montYPP
SELECT yards WHERE (dPlayers CONTAINS 55)
$montYards SUM
$montPlays COUNT SELECT plays WHERE (dPlayers CONTAINS 55)
DIVIDE $montYards $montPLays
RETURN


```
Expected Result: {reedYPP:3.35,montYPP: 4.56}

2. In Week 1 versus the Broncos, what percentage of the Broncos run plays 
from under center featured a condensed formation?

```sql
USE y2024.w1.D.[plays, runPass, underCenterOrGun, offensiveFormation]

QUERY runs
PERCENT_OF SELECT plays WHERE (runPass = "R" & offensiveFormation CONTAINS "Condensed")

RETURN
```
Expected Result: {runs:75}

3. Did the Seahawks have a higher undercenter pass percentage against the Broncos or the Patriots?
```sql
USE y2024.[w1, w2].O.[plays, runPass, underCenterOrGun]

QUERY pass
PERCENT_OF SELECT plays WHERE (runPass="R" & underCenterOrGun="G")

RETURN
```
Expected Result: {pass:{w1:75,w2:88.8}}

4. In Week 1 versus the Broncos, what was the Broncos favorite coverage? What was the percentage of that coverage?
```sql
USE y2024.w1.O.[plays, coverage]

QUERY favCoverage
$mostOccuringCoverage MOST_FREQUENT SELECT coverage
RETURN //Returns the contents of the variable - the contents of that select are still the context

QUERY perCoverage
PERCENT_OF SELECT plays WHERE (coverage=$mostOccuringCoverage) // Variables are always global
RETURN
```
Expected Result: {favCoverage:"Cover 1", perCoverage: 46}

5. Against the Patriots, did the Seahwaks average more yards on Zone runs or gap runs?
```sql
USE y2024.w2.O.[plays, runType, yards]

QUERY zoneAvg
SELECT yards WHERE (runType = "Zone")
$zoneYards SUM
$zonePlays COUNT SELECT plays WHERE (runType = "Zone")
DIVIDE $zoneYards $zonePlays
RETURN

QUERY gapAvg
SELECT yards WHERE (runType = "Gap")
$gapYards SUM
$gapPlays COUNT SELECT plays WHERE (runType = "Gap")
DIVIDE $gapYards $gapPlays
RETURN
```
Expected Result: {zoneAvg:2.83, gapAvg:2.00}

6. How many yards did the Seahawks average on play action in Week 2?
```sql
USE y2024.w2.O.[plays, playType, yards]

QUERY paAvg
SELECT yards WHERE (playType = "Y")
$paYards SUM
$paPlays COUNT SELECT plays WHERE (playType = "PlayAction")
DIVIDE $paYards $paPlays
RETURN
```
Expected Result: {paAvg:2}

7. In what percentage of passing plays did the Broncos blitz the Seahawks?
```sql
USE y2024.w1.D.[plays, runPass, blitz]

QUERY blitzPercent
PERCENT_OF SELECT plays WHERE (runPass = "P" & blitz = "Y") 
RETURN
```
Expected Result: {blitzPercent: 50}

8. On Julian Love's interception against the Broncos, what coverage and front were the Seahawks in?
```sql
USE y2024.w1.O.[coverage, front, playOutcume, actuator]

QUERY int
SELECT [coverage, front] WHERE (actuator = 20 & playOutcome="Interception")
RETURN
```
Expected Result: {int:{coverage: "Quarters", front:"4-0"}}




## Language Design

### Core Structure
SSOQL follows a simple structure with named query blocks that contain operations on data. Each query can have multiple operations that process the data and produce a result.

### Assumed Data
Lots of data is assumed to reduce complexity. For example, if a query uses a key name for something far down in USE context with multiple contexts, it will return the query ran on all of the possible assumed fields. For example,
```
USE [y2024, y2025].[w1, w2].O.plays

QUERY numPlays
COUNT SELECT plays
RETURN
```
Expected Result: {y2024: {w1: 51, w2: 62}, y2025: {w1:42, w2:74}}

Since we use plays, we assume to run the query on all possible source objects and returns an object based on those possible source objects.

### Keywords and Operations

#### USE
A keyword to pull in data from the javascript object. Specifies which data sources and fields to use in the query. Use can be... used... anywhere outside of a QUERY statement.

Syntax:
```
USE x.x.[key1, key2, ...]
```

Examples:
```
USE y2024.w1.D.[plays, yards, dPlayers]
USE y2024.[w1, w2].O.[plays, runPass, underCenterOrGun]
```

When using data, it will pull in ALL the available data possible. For the second USE in the example, it will pullin both week 1 and week 1 plays, runPass, and underCenterOrGun

#### QUERY
Defines a named block of operations that process data. Multiple query blocks can exist in a single SSOQL string. 

Syntax:
```
QUERY queryName
  operations...
RETURN
```

#### SELECT
Retrieves data from the current context based on specified criteria.

Syntax:
```
SELECT field(s) [WHERE (condition)]
```

Examples:
```
SELECT yards WHERE (dPlayers CONTAINS 90)
SELECT [coverage, front] WHERE (actuator = 20 & playOutcome="Interception")
```

#### WHERE
Filters data based on conditions. Used with SELECT to specify which data to retrieve.

Syntax for conditions:
- Equality: `field = value`
- Contains: `field CONTAINS value`
- Logical AND: `condition1 & condition2`

#### Variables
Variables store intermediate results for later use. Variable names are prefixed with $.

Syntax:
```
$variableName operation
```

Examples:
```
$reedYards SUM
$mostOccuringCoverage MOST_FREQUENT SELECT coverage
```

Variables are global across all query blocks in a statement.

#### Operations

##### Data Aggregation
- `SUM`: Calculates the sum of values
- `COUNT`: Counts the number of items
- `DIVIDE`: Divides one value by another
- `PERCENT_OF`: Calculates what percentage one set is of another
- `MOST_FREQUENT`: Finds the most frequently occurring value

Examples:
```
$reedYards SUM
$reedPlays COUNT SELECT plays WHERE (dPlayers CONTAINS 90)
DIVIDE $reedYards $reedPlays
PERCENT_OF SELECT plays WHERE (runPass = "P" & blitz = "Y")
```

#### RETURN
Marks the end of a query block and returns the current context or the value of the last operation.

### Comments
Comments can be added with double slashes. They provide documentation but don't affect query execution.

Example:
```
RETURN //Returns the contents of the variable - the contents of that select are still the context
```

### Data Types
- Strings: Represented with double quotes (e.g., `"R"`, `"PlayAction"`)
- Numbers: Represented without quotes (e.g., `90`, `55`)
- Arrays: Fields can contain arrays, which can be checked with the CONTAINS operator

### Execution Model
Each query is executed in sequence. The query's result is determined by the last operation before the RETURN statement. When multiple query blocks exist, the results are combined into a single object with keys matching the query names.