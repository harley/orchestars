import React from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Event } from '@/payload-types'

interface DateSelectorProps {
  schedules: NonNullable<Event['schedules']>
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
}

const DateSelector: React.FC<DateSelectorProps> = ({ schedules, selectedDate, onDateSelect }) => {

  return (
    <div className="w-full mb-8">
      <h3 className="text-xl font-bold mb-4 text-center">Chọn ngày bạn muốn tham dự</h3>
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
        <div className="flex flex-wrap gap-2 justify-center">
          {schedules.map((schedule) => (
            <Button
              type="button"
              key={schedule.id}
              variant={
                selectedDate &&
                selectedDate.toDateString() === new Date(schedule.date as string).toDateString()
                  ? 'secondary'
                  : 'outline'
              }
              onClick={() => onDateSelect(new Date(schedule.date as string))}
              className="transition-all"
            >
              {format(new Date(schedule.date as string), 'EEE, MMM d')}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DateSelector
