import SeatReservationClient from '@/components/EventDetail/SeatReservation/SeatSelection/SeatComponent.client'
import TicketPriceSeatReservationClient from './TypeSelection/TicketPriceComponent.client';


const IS_EARLY_BIRD= false
const SeatReservationCli =  ({
  event,
 unavailableSeats,
}: {
  event: Event
  unavailableSeats?: string[]
}) => {
  return (
    <>
    {IS_EARLY_BIRD &&  (<TicketPriceSeatReservationClient event={event}/>)}
    {!IS_EARLY_BIRD &&  (<SeatReservationClient event={event} unavailableSeats={unavailableSeats} />)};
    </>
  )
};
export default SeatReservationCli; 