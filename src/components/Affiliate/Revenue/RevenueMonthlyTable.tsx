import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatMoney } from '@/utilities/formatMoney'
import { Skeleton } from '@/components/ui/skeleton'

export type RevenueItem = {
  month: string
  gross: number
  net: number
  commission: number
  orders: number
  tickets: number
}

interface RevenueMonthlyTableProps {
  monthlyRevenue: RevenueItem[]
  loading: boolean
}

export const RevenueMonthlyTable: React.FC<RevenueMonthlyTableProps> = ({
  monthlyRevenue,
  loading,
}) => (
  <Card className="shadow-md">
    <CardHeader>
      <CardTitle>Monthly Revenue Trends</CardTitle>
      <CardDescription>Revenue performance over the last 6 months</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Gross Revenue</TableHead>
              <TableHead className="text-right">Net Revenue</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Tickets</TableHead>
              <TableHead className="text-right">Avg Order Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell className="font-medium">
                  <Skeleton className="h-4  rounded-xl bg-black/10" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4  rounded-xl bg-black/10" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4  rounded-xl bg-black/10" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4  rounded-xl bg-black/10" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4  rounded-xl bg-black/10" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="h-4  rounded-xl bg-black/10" />
                </TableCell>
              </TableRow>
            ) : (
              (monthlyRevenue || []).map((month) => (
                <TableRow key={month.month}>
                  <TableCell className="font-medium">{month.month}</TableCell>
                  <TableCell className="text-right">{formatMoney(month.gross)}</TableCell>
                  <TableCell className="text-right">{formatMoney(month.net)}</TableCell>
                  <TableCell className="text-right">{month.orders}</TableCell>
                  <TableCell className="text-right">{month.tickets}</TableCell>
                  <TableCell className="text-right">
                    {formatMoney(month.orders ? month.net / month.orders : 0)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
)
