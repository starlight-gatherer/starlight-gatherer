# Starlight Gatherer API 文档

Base URL: `http://localhost:3000/api/v1`

## 认证

所有 **GET** 请求无需认证。

所有写入请求（POST / PATCH / DELETE）需要在请求头中携带 API Key：

```
x-api-key: <ADMIN_API_KEY>
```

未携带或 Key 错误时返回 `401 Unauthorized`。

---

## 数据模型

```
SeriesType ──< Series ──< Event ──< Archive >── Archive (PartToFull 自关联)
```

### Archive

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 主键，如 `"1"`, `"10-1"` |
| title | string | 视频标题 |
| year | int | 年份 |
| videoUrl | string? | Bilibili 视频链接 |
| bv | string? | BV 号 |
| isTranslated | int | `-1`=未知, `0`=生肉, `1`=熟肉, `2`=机翻 |
| fullVersionId | string? | 切片对应的完整版 Archive ID |
| eventId | int? | 所属 Event ID |
| seriesVol | int? | 系列中的期数 |
| createdAt | DateTime | 创建时间 |
| updatedAt | DateTime | 更新时间 |

### Event

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 自增主键 |
| title | string | 活动标题 |
| typeId | int? | SeriesType ID |
| date | DateTime? | 活动日期 |
| isVirtual | boolean | 是否为线上活动 |
| seriesId | int? | 所属 Series ID |

### Series

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 自增主键 |
| title | string | 系列标题（唯一） |
| seriesTypeId | int? | SeriesType ID |

### SeriesType

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int | 自增主键 |
| name | string | 类型名称（唯一） |

现有类型：`musical`, `live`, `nama_housou`, `mixed_live`, `fest`, `reading_theatre`, `radio`, `talking`, `other`

---

## Archives

### GET /archives

获取 Archive 列表，支持筛选。

**Query 参数：**

| 参数 | 类型 | 说明 |
|------|------|------|
| year | int | 按年份筛选 |
| isTranslated | int | 按翻译状态筛选 (`-1`/`0`/`1`/`2`) |
| eventId | int | 按所属 Event 筛选 |

**响应：** `200 OK`

```json
[
  {
    "id": "1",
    "title": "【中字】聖翔音楽学院放送局 Vol.1",
    "year": 2017,
    "videoUrl": "https://www.bilibili.com/video/BV12x411b7de",
    "bv": "BV12x411b7de",
    "isTranslated": 1,
    "fullVersionId": null,
    "eventId": 1,
    "seriesVol": 1,
    "event": {
      "id": 1,
      "title": "聖翔音楽学院放送局 Vol.1",
      "series": { "id": 1, "title": "圣翔音乐学院放送局" }
    },
    "fullVersion": null,
    "parts": []
  }
]
```

---

### POST /archives

创建一条 Archive。

**认证：** 需要 `x-api-key`

**请求体：**

```json
{
  "id": "999",
  "title": "视频标题",
  "year": 2025,
  "videoUrl": "https://www.bilibili.com/video/BVxxxxxxxxx",
  "bv": "BVxxxxxxxxx",
  "isTranslated": 1,
  "fullVersionId": null,
  "eventId": 1,
  "seriesVol": null
}
```

**必填：** `id`, `title`, `year`

**响应：** `201 Created` / `409 Conflict`（ID 重复）

---

### GET /archives/:id

获取单条 Archive 详情。

**响应：** `200 OK` / `404 Not Found`

---

### PATCH /archives/:id

更新 Archive 字段。

**认证：** 需要 `x-api-key`

**请求体：** 只传需要更新的字段。

```json
{
  "title": "新标题",
  "isTranslated": 1,
  "videoUrl": "https://www.bilibili.com/video/BVnewxxxxxx"
}
```

**响应：** `200 OK` / `404 Not Found`

---

### DELETE /archives/:id

删除一条 Archive。

**认证：** 需要 `x-api-key`

**响应：** `200 OK` `{ "success": true }` / `404 Not Found`

---

## Events

### GET /events

获取所有 Event 列表。

**响应：** `200 OK`

```json
[
  {
    "id": 1,
    "title": "聖翔音楽学院放送局 Vol.1",
    "typeId": 1,
    "date": null,
    "isVirtual": false,
    "seriesId": 1,
    "_count": { "archives": 2 },
    "type": { "id": 1, "name": "nama_housou" },
    "series": { "id": 1, "title": "圣翔音乐学院放送局" }
  }
]
```

---

### POST /events

创建一条 Event。

**认证：** 需要 `x-api-key`

**请求体：**

```json
{
  "title": "活动标题",
  "typeId": 1,
  "date": "2025-04-08",
  "isVirtual": false,
  "seriesId": 1
}
```

**必填：** `title`

**响应：** `201 Created` / `409 Conflict`

---

### GET /events/:id

获取单条 Event 详情（包含 archives 列表）。

**响应：** `200 OK` / `404 Not Found`

---

### PATCH /events/:id

更新 Event 字段。

**认证：** 需要 `x-api-key`

**请求体：** 只传需要更新的字段。`date` 字段接受 ISO 字符串，会自动转换为 Date 对象。

```json
{
  "title": "新标题",
  "date": "2025-05-01",
  "seriesId": 2,
  "typeId": 3
}
```

**响应：** `200 OK` / `404 Not Found`

---

### DELETE /events/:id

删除一条 Event。

**认证：** 需要 `x-api-key`

**注意：** 仅删除 Event 本身，关联的 Archives 不会被删除（其 `eventId` 会变为 `null`）。

**响应：** `200 OK` `{ "success": true }` / `404 Not Found`

---

### POST /events/:id/merge

将多个源 Event 合并到目标 Event。所有源 Event 的 Archives 会被移动到目标 Event，然后源 Event 被删除。

**认证：** 需要 `x-api-key`

**请求体：**

```json
{
  "sourceIds": [10, 11, 12]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| sourceIds | int[] | 要合并的源 Event ID 数组（不可包含目标 ID） |

**响应：** `200 OK`

```json
{
  "success": true,
  "mergedCount": 3,
  "targetId": 5
}
```

**错误：**
- `400` — sourceIds 为空或包含目标 ID
- `500` — 事务执行失败

---

## Series

### GET /series

获取所有 Series 列表（公开只读接口）。

**响应：** `200 OK`

```json
[
  {
    "id": 1,
    "title": "圣翔音乐学院放送局",
    "seriesTypeId": 1,
    "seriesType": { "id": 1, "name": "nama_housou" },
    "_count": { "events": 15 }
  }
]
```

---

### GET /series-crud

获取所有 Series 列表（管理用，包含 SeriesType 信息）。

**响应：** `200 OK`

同 `/series` 格式。

---

### POST /series-crud

创建一条 Series。

**认证：** 需要 `x-api-key`

**请求体：**

```json
{
  "title": "新系列",
  "seriesTypeId": 1
}
```

**必填：** `title`

**响应：** `201 Created` / `409 Conflict`（title 重复）

---

### GET /series-crud/:id

获取单条 Series 详情（包含 events 列表）。

**响应：** `200 OK` / `404 Not Found`

---

### PATCH /series-crud/:id

更新 Series 字段。

**认证：** 需要 `x-api-key`

**请求体：** 只传需要更新的字段。

```json
{
  "title": "新标题",
  "seriesTypeId": 2
}
```

**响应：** `200 OK` / `404 Not Found`

---

### DELETE /series-crud/:id

删除一条 Series。

**认证：** 需要 `x-api-key`

**响应：** `200 OK` `{ "success": true }` / `404 Not Found`

---

## Upload Cover

### POST /upload-cover

上传 Series 封面图片。

**认证：** 需要 `x-api-key`

**请求格式：** `multipart/form-data`

| 字段 | 类型 | 说明 |
|------|------|------|
| file | File | 图片文件（支持 jpg, jpeg, png, webp, gif） |
| seriesId | string | Series ID |

**存储路径：** `public/images/series/{seriesId}.{ext}`

**响应：** `200 OK`

```json
{
  "success": true,
  "path": "/images/series/1.png"
}
```

**错误：**
- `400` — 缺少 file 或 seriesId，或不支持的文件格式
- `500` — 文件写入失败

---

## 错误响应格式

所有错误返回统一的 JSON 格式：

```json
{ "error": "错误描述" }
```

| HTTP 状态码 | 说明 |
|-------------|------|
| 400 | 请求参数错误 |
| 401 | 未认证（缺少或错误的 API Key） |
| 404 | 资源不存在 |
| 409 | 冲突（如 ID 重复） |
| 500 | 服务器内部错误 |
