ffmpeg -i 4320211.mp3 -f s16le -acodec pcm_s16le -ar 24000 -ac 1 output.pcm

ffmpeg -f s16le -ar 24000 -ac 1 -i 4320211.pcm -ss 00:00:00 -t 00:00:20 -f s16le -ar 24000 -ac 1 -acodec pcm_s16le short.pcm

ffplay -autoexit -f s16le -acodec pcm_s16le -ar 24000 output.pcm




单纯从项目的需求看，这是一个典型的OLAP项目（查询横跨Account， Cash， Fund。。。），适合采用数据仓库方案，擅长数据分析（列式存储，方便做表关联，）。
考虑到将来要把写入需求也迁移到云上，可以数据存储采用两阶段方案：权限如何控制？
1. 数据仓库（只读）: Redshift。
a. 采用经典的数据仓库纬度建模方法论进行表设计：
事实表：
纬度表：
2. 读写：
a. ShardingSphere + RDS + Redshift;
b. Aurora (+ ShardingSphere) + Redshift;
c. TiDB
数据迁移：
a.Kafka + Kenesis + Lambda;
b.Kafka + Flink
Account
- Id: Long
- Birthday: Date
- RPQ: Enum(Secure, Very Cautious, Caustious, Balanced, Adventurous, Speculative)
- Country of residency: Enum
- Nationality: Enum
- Integrated Relationship Agreement: Enum(Deposits & Loads, Capital Market Products, Managed Product Categories), multiple values
- Years on book: Date
- On-shore/Off-shore
- Accrued Investor: Boolean
- Wealth Ready: Enum (UT Wealth Ready, Equity Wealth Ready, Structured Proudcts Wealth Ready, Bonds Wealth Ready)
Investment
- Account Id: Long
- Fund Id: Long
- Holding Start: Date
- Holding End: Date
- Holding Price: Numeric
- Holding Amount: Numeric
Fund
- Id: Long
- category: Reference, multiple values
- house: Reference
- name: String
- Product code: String
- Current price: Numeric
Policy settlement
Policy id: long
Date Id: long
Time Id: long
Currency: enum
Amount: long
Insurance Policy
- Id: Long
- Account id: Long
- Insurance Product Id: Long
- Policy number
- Premium settlement date
- policy status
- start date
Insurance Proudct
- id: long
- category: Reference
- product code: String
- Insurer: String
Cash Flow
id: long
account id: long
one-time: boolean
direction: enum (in, out)
currency: enum
amount: numeric
TMD
id: long
account id: long
currency: enum
amount: numeric
interest rate: numeric
start date: date
interest rate type: enum
tenor: long

Date

Time
