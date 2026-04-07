/**
 * Series configuration file
 *
 * 封面图命名规则：将图片放入 public/images/series/ 目录
 * 文件名格式：{seriesId}.{png|jpg|webp}
 * 例如：1.png, 2.jpg, 3.webp
 *
 * 如果没有配置封面图，将使用渐变色背景
 */

// 系列封面图配置
// key: seriesId (数字)
// value: 图片路径 (相对于 public 目录)
export const SERIES_COVERS: Record<number, string | null> = {
  // 示例配置（取消注释并替换为实际文件名）:
  // 1: "/images/series/1.png",
  2: "/images/series/cover_stage.jpg",
  // 3: "/images/series/3.webp",
};

// 系列主题色配置
export const SERIES_ACCENT: Record<string, "red" | "yellow" | "blue"> = {
  // 舞台剧系列 - 红色
  "The LIVE": "red",
  "The LIVE 青岚": "red",

  // 官方 LIVE 系列 - 黄色
  "STARLIVE": "yellow",
  "SPECIAL LIVE": "yellow",

  // 放送/直播系列 - 蓝色
  "聖翔音楽学園 放送局": "blue",
  "スタリライブ配信中": "blue",
  "シークフェルト音楽学院 放送室": "blue",
};

/**
 * 获取系列封面图路径
 * @param seriesId 系列ID
 * @returns 封面图路径，如果未配置则返回 null
 */
export function getSeriesCover(seriesId: number): string | null {
  return SERIES_COVERS[seriesId] ?? null;
}

/**
 * 获取系列主题色
 * @param seriesTitle 系列标题
 * @returns 主题色名称
 */
export function getSeriesAccent(seriesTitle: string): "red" | "yellow" | "blue" {
  return SERIES_ACCENT[seriesTitle] ?? "red";
}
