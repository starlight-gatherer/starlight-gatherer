import { prisma } from "./db";

const DEFAULT_COVER = "/images/series/default.png"

/**
 * 获取系列封面图路径
 * @param seriesId 系列ID
 * @returns 封面图路径，如果未配置则返回 null
 */
export async function getSeriesCover(seriesId: number): Promise<string> {
  const series = await prisma.series.findUnique({
    where: { id: seriesId },
    select: { coverURL: true }
  });
  return series?.coverURL ?? DEFAULT_COVER;
}
