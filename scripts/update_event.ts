import "dotenv/config";
import { PrismaClient } from '../src/generated/prisma/client'

const prisma = new PrismaClient()

/**
 * =========================================================
 * 你的手工作业区：配置旧的 Series ID 应该如何转换到新结构
 * =========================================================
 * 策略 (strategy) 说明：
 * 'SINGLE_EVENT' : 适用于 Live。这个旧 seriesId 下的所有视频将被归入同一个新 Event 中。
 * 'EACH_ARCHIVE_IS_EVENT' : 适用于广播。这个旧 seriesId 下的*每一个*视频，都会被独立创建成一个事件（期数），名字直接用视频的名字。
 */
const MIGRATION_CONFIG: Record<number, {
    typeName: string;       // 对应 SeriesType
    strategy: 'SINGLE_EVENT' | 'EACH_ARCHIVE_IS_EVENT';
    newSeriesTitle?: string; // 归属的宏观 Series 名字
    eventTitle?: string;    // SINGLE_EVENT 专属：生成的具体 Event 名字
}> = {
    // 示例 1: 原本把一场Live当做了Series，现在纠正它
    8: {
        typeName: "fest",
        strategy: "SINGLE_EVENT"
    },
    // 示例 2: 原本就是Series，需要变为拆散的广播 Event
    1: {
        typeName: "nama_housou",
        strategy: "EACH_ARCHIVE_IS_EVENT",   // 脚本会自动把此 ID 下的每一期视频独立建一个 Event
    },
    2: {
        typeName: "musical",
        strategy: "EACH_ARCHIVE_IS_EVENT",
    },
    5: {
        typeName: "live",
        strategy: "EACH_ARCHIVE_IS_EVENT",
    },
    6: {
        typeName: "nama_housou",
        strategy: "EACH_ARCHIVE_IS_EVENT",
    },
    7: {
        typeName: "mixed_live",
        strategy: "EACH_ARCHIVE_IS_EVENT",
    },
    9: {
        typeName: "mixed_live",
        strategy: "EACH_ARCHIVE_IS_EVENT",
    },
    10: {
        typeName: "nama_housou",
        strategy: "SINGLE_EVENT"
    },
    11: {
        typeName: "nama_housou",
        strategy: "EACH_ARCHIVE_IS_EVENT",
    },
    12: {
        typeName: "nama_housou",
        strategy: "EACH_ARCHIVE_IS_EVENT",
    },
    13: {
        typeName: "nama_housou",
        strategy: "SINGLE_EVENT",
    },
    14: {
        typeName: "musical",
        strategy: "EACH_ARCHIVE_IS_EVENT",
    },
    16: {
        typeName: "nama_housou",
        strategy: "EACH_ARCHIVE_IS_EVENT",
    },
    17: {
        typeName: "radio",
        strategy: "EACH_ARCHIVE_IS_EVENT"
    },
    18: {
        typeName: "talking",
        strategy: "SINGLE_EVENT"
    },
    19: {
        typeName: "talking",
        strategy: "SINGLE_EVENT"
    },
    20: {
        typeName: "musical",
        strategy: "EACH_ARCHIVE_IS_EVENT"
    },
    21: {
        typeName: "sports",
        strategy: "SINGLE_EVENT"
    },
    22: {
        typeName: "reading_theatre",
        strategy: "SINGLE_EVENT"
    },
    23: {
        typeName: "mixed_live",
        strategy: "SINGLE_EVENT"
    },
    25: {
        typeName: "live",
        strategy: "SINGLE_EVENT"
    },
    27: {
        typeName: "reading_theatre",
        strategy: "EACH_ARCHIVE_IS_EVENT"
    },
    29: {
        typeName: "nama_housou",
        strategy: "SINGLE_EVENT"
    },
    30: {
        typeName: "nama_housou",
        strategy: "SINGLE_EVENT"
    },
    31: {
        typeName: "talking",
        strategy: "SINGLE_EVENT"
    },
}

async function main() {
  console.log("🚀 开始执行结构迁移...")

  // 1. 获取所有还没有迁移的 Archive (避免重复执行出错)
  const archivesToMigrate = await prisma.archive.findMany({
    where: { 
      seriesId: { not: null }, // 有旧关联
      eventId: null            // 还未建立新关联
    }
  })

  console.log(`找到 ${archivesToMigrate.length} 个亟待迁移的视频记录。`)

  for (const archive of archivesToMigrate) {
    const oldSeriesId = archive.seriesId!
    const config = MIGRATION_CONFIG[oldSeriesId]

    if (!config) {
      console.warn(`[跳过] 未在 MIGRATION_CONFIG 中找到原 seriesId: ${oldSeriesId} 的配置。`)
      continue
    }

    let targetSeriesTitle = config.newSeriesTitle
    // 如果未指定新名字，且策略为独立生成 Event，则回退使用原 Series 的名字
    if (!targetSeriesTitle) {
      const originalSeries = await prisma.series.findUnique({
        where: { id: oldSeriesId }
      })
      if (!originalSeries) {
        throw new Error(`找不到原 Series (ID: ${oldSeriesId})`)
      }
      targetSeriesTitle = originalSeries.title
    } else if (!targetSeriesTitle) {
      throw new Error(`SeriesId ${oldSeriesId} 未配置 newSeriesTitle`)
    }

    // A. 确保 Type 存在
    const sType = await prisma.seriesType.upsert({
      where: { name: config.typeName },
      update: {},
      create: { name: config.typeName }
    })

    // B. 确保新的 父级Series 存在
    const newSeries = await prisma.series.upsert({
      where: { title: targetSeriesTitle },
      update: { seriesTypeId: sType.id }, // 重新绑定Type
      create: {
        title: targetSeriesTitle,
        seriesTypeId: sType.id
      }
    })

    // C. 根据不同策略创建或复用 Event
    let targetEventId: number

    if (config.strategy === 'SINGLE_EVENT') {
      // 注意：这里我们通过 title 和 seriesId 联合查找以防止同名
      let targetEvent = await prisma.event.findFirst({
        where: { title: targetSeriesTitle, seriesId: newSeries.id }
      })
      if (!targetEvent) {
        targetEvent = await prisma.event.create({
          data: { title: targetSeriesTitle, seriesId: newSeries.id, isVirtual: true }
        })
      }
      targetEventId = targetEvent.id

    } else {
       // 广播模式：每一个视频直接生成一个自己的 Event
       // 用 archive 的名字命名该期数
       const targetEvent = await prisma.event.findFirst({
         where: { 
           title: archive.title, 
           seriesId: newSeries.id
         }
       })
       
       // 如果不存在，才创建新的 Event
        if (!targetEvent) {
            const eventTarget = await prisma.event.create({
                data: {
                    title: archive.title, // 取名叫 "浦星广播第30回" 或者依原意
                    seriesId: newSeries.id,
                    isVirtual: false
                }
            })
            targetEventId = eventTarget.id
        }
        else {
            targetEventId = targetEvent.id
        }
    }

    // D. 给 Archive 绑定新的 Event ID
    await prisma.archive.update({
      where: { id: archive.id },
      data: { eventId: targetEventId }
    })

    console.log(`✅ 已迁移视频: ${archive.title}`)
  }

  console.log("🎉 迁移完毕！请检查数据库是否正确！")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
