import { Event } from '@/payload-types'
import React from 'react'
import { format as dateFnsFormat, isValid } from 'date-fns'

interface ScheduleItem {
  id: string
  date: string
  details: {
    id: string
    name: string
    time: string
    description: string
  }[]
}

const Schedule = ({ schedules }: { schedules: Event['schedules'] }) => {
  const _schedules = (schedules as ScheduleItem[])
    ?.filter((sch) => !!sch)
    .map((sch) => sch as unknown as ScheduleItem)

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Lịch trình</h2>

        <div className="max-w-3xl mx-auto">
          {_schedules.map((schedule, idx) => (
            <div key={idx} className="mb-8">
              <h3 className="text-2xl font-bold mb-4 text-purple-700">
                {schedule?.date && isValid(new Date(schedule.date))
                  ? dateFnsFormat(schedule.date, 'dd/MM/yyyy')
                  : schedule?.date}
              </h3>

              {schedule.details?.map((item, index) => (
                <div
                  key={index}
                  className="flex mb-6 group hover:bg-gray-50 p-3 rounded-lg transition-colors"
                >
                  <div className="w-24 flex-shrink-0 font-bold text-purple-600">{item.time}</div>
                  <div className="border-l-2 border-purple-300 pl-4 ml-4">
                    <h4 className="font-bold text-lg group-hover:text-purple-700 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Schedule
