"use client"

import React, { useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

async function validateTicketWithAPI(ticketData: any) {

    console.log('ticketData', ticketData)

  const res = await fetch("/api/checkin-app/checkin/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ticketData),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Ticket validation failed");
  }
  return data.ticket;
}

export default function CheckinScanPage() {
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [scannerKey, setScannerKey] = useState(0);

  const handleScan = async (results: any) => {
    if (!results?.[0]?.rawValue) return;
    setLoading(true);
    setError(null);
    setTicket(null);
    try {
      let ticketData;
      try {
        ticketData = JSON.parse(results[0].rawValue);
      } catch {
        throw new Error("QR code is not a valid ticket format");
      }
      const validated = await validateTicketWithAPI(ticketData);
      setTicket(validated);
      toast({
        title: "Vé hợp lệ!",
        description: `Mã vé: ${validated.ticketCode}`,
        duration: 2000,
      });
    } catch (e: any) {
      setError(e.message);
      toast({
        title: "Lỗi xác thực vé",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = () => {
    setTicket(null);
    setError(null);
    setLoading(false);
    setConfirming(false);
    setScannerKey((k) => k + 1); // force Scanner remount
  };

  const handleConfirmCheckin = async () => {
    if (!ticket) return;
    setConfirming(true);
    try {
      // Call your check-in API here (not implemented in this snippet)
      // Example: await confirmCheckinAPI(ticket.ticketCode, ...)
      toast({
        title: "Check-in thành công!",
        description: `Vé ${ticket.ticketCode} đã được xác nhận check-in.`,
        duration: 2000,
      });
      setTicket({ ...ticket, checkedIn: true });
    } catch (e: any) {
      toast({
        title: "Lỗi check-in",
        description: e.message,
        variant: "destructive",
      });
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-start py-8 px-2">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-blue-900">
            Event Ticket Check-in
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6 items-center">
            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-blue-200 shadow-sm bg-gray-100">
              <Scanner
                key={scannerKey}
                onScan={handleScan}
                onError={(err: any) => setError("Camera error: " + (err?.message || ""))}
                constraints={{ facingMode: "environment" }}
                formats={["qr_code"]}
                styles={{
                  container: { width: "100%", height: "100%" },
                  video: { width: "100%", height: "100%", objectFit: "cover" },
                }}
              />
            </div>
            {loading && (
              <div className="text-blue-600 animate-pulse">Đang kiểm tra vé...</div>
            )}
            {error && (
              <div className="text-red-500 font-medium text-center">{error}</div>
            )}
            {!ticket && !loading && !error && (
              <div className="text-gray-500 text-center text-sm">
                Đưa mã QR của vé trước camera để kiểm tra và xác nhận vé hợp lệ.<br />
                <span className="text-xs text-gray-400">(Chỉ hỗ trợ QR code hợp lệ của hệ thống)</span>
              </div>
            )}
            {ticket && (
              <div className="w-full mt-2">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>Thông tin vé</span>
                      <Badge variant="outline" className="text-xs px-2 py-1 bg-green-100 text-green-700 border-green-300">
                        {ticket.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-blue-900">
                    <div className="flex justify-between">
                      <span className="font-semibold">Tên khách:</span>
                      <span>{ticket.user?.firstName} {ticket.user?.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Email:</span>
                      <span>{ticket.user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Sự kiện:</span>
                      <span>{ticket.event}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Ghế:</span>
                      <span>{ticket.seat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Ngày diễn:</span>
                      <span>{ticket.eventDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Trạng thái check-in:</span>
                      <span>
                        {ticket.checkedIn ? (
                          <Badge className="bg-gray-400 text-white">Đã check-in</Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white">Chưa check-in</Badge>
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            {/* Always show action buttons for best admin UX */}
            <div className="flex flex-col md:flex-row gap-3 w-full mt-4 justify-center items-center">
              <Button
                variant="outline"
                className="border-blue-400 text-blue-700 hover:bg-blue-50"
                onClick={handleRescan}
                disabled={loading || confirming}
              >
                Quét lại
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded shadow"
                onClick={handleConfirmCheckin}
                disabled={
                  loading || confirming || !ticket || ticket.checkedIn || error || (ticket && ticket.status !== 'booked')
                }
              >
                {confirming ? 'Đang xác nhận...' : 'Xác nhận check-in'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
