import React from 'react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

const UpcomingSaleBanner = () => {
  return (
    <section className="mt-6 mb-6">
      <Alert className="bg-amber-50 border-amber-200 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="outline"
                className="bg-amber-100 text-amber-800 border-amber-300 text-[18px] py-2 px-4"
              >
                Sắp mở bán
              </Badge>
              <AlertTitle className="text-amber-800 !mb-0">Bạn đã sẵn sàng chưa?</AlertTitle>
            </div>
            <AlertDescription className="text-amber-700">
              <p>
                Cơ hội không thể bỏ lỡ! Vé sẽ chính thức mở bán trong thời gian tới. Hãy sẵn sàng để
                sở hữu tấm vé của bạn và trải nghiệm sự kiện đáng mong chờ nhất!
              </p>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </section>
  )
}

export default UpcomingSaleBanner
