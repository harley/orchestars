
import { Media } from '@/payload-types'
import React from 'react'

const EventScheduleImage = ({ scheduleImage }: { scheduleImage: Media }) => {
    return (
        <section className="schedule-image py-12 overflow-hidden">
            <div className="px-4 relative overflow-hidden">
                <img
                    src={`${process.env.APP_BASE_URL}${(scheduleImage as Media)?.url}`}
                    alt="Schedule"
                    className="max-w-full max-h-full object-cover object-center"
                />
            </div>


        </section>
    )
}

export default EventScheduleImage
