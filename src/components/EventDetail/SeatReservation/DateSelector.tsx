import React from 'react'
import { format } from 'date-fns'
// import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
// import { cn } from '@/lib/utils'
// import { CalendarIcon } from 'lucide-react'
import { Event } from '@/payload-types'
import { useTranslate } from '@/providers/I18n/client'

interface DateSelectorProps {
  schedules: NonNullable<Event['schedules']>
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
}

const DateSelector: React.FC<DateSelectorProps> = ({ schedules, selectedDate, onDateSelect }) => {
  const { t } = useTranslate()

  // Convert schedule dates to Date objects for the calendar
  // const availableDates = schedules
  //   .filter((schedule) => schedule.date)
  //   .map((schedule) => new Date(schedule.date as string))

  // const isDateAvailable = (date: Date) => {
  //   return availableDates.some(
  //     (availableDate) => availableDate.toDateString() === date.toDateString(),
  //   )
  // }

  return (
    <div className="w-full mb-8">
      <h3 className="text-xl font-bold mb-4 text-center">{t('event.selectDateToAttend')}</h3>
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
        {/* <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full sm:w-[240px] justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : <span>Chọn ngày</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              disabled={(date) => !isDateAvailable(date)}
              initialFocus
              className={cn('p-3 pointer-events-auto')}
            />
          </PopoverContent>
        </Popover> */}

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
