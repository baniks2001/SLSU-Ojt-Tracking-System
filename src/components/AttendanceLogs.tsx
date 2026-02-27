'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Calendar, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AttendanceLogsProps {
  studentId: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  morningIn?: string;
  morningOut?: string;
  afternoonIn?: string;
  afternoonOut?: string;
  eveningIn?: string;
  eveningOut?: string;
  shiftType: 'regular' | 'graveyard';
  totalHours: number;
  undertimeMinutes: number;
  status: 'present' | 'absent' | 'late' | 'half_day';
  remarks?: string;
}

export default function AttendanceLogs({ studentId }: AttendanceLogsProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchAttendance();
  }, [studentId, selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/attendance?studentId=${studentId}&month=${selectedMonth}&year=${selectedYear}`);
      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance || []);
      } else {
        toast.error('Failed to fetch attendance records');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error('An error occurred while fetching attendance');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-600">Present</Badge>;
      case 'late':
        return <Badge className="bg-yellow-600">Late</Badge>;
      case 'absent':
        return <Badge className="bg-red-600">Absent</Badge>;
      case 'half_day':
        return <Badge className="bg-orange-600">Half Day</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Morning In', 'Morning Out', 'Afternoon In', 'Afternoon Out', 'Evening In', 'Evening Out', 'Total Hours', 'Status'];
    const csvContent = [
      headers.join(','),
      ...attendance.map(record => [
        formatDate(record.date),
        formatTime(record.morningIn),
        formatTime(record.morningOut),
        formatTime(record.afternoonIn),
        formatTime(record.afternoonOut),
        formatTime(record.eveningIn),
        formatTime(record.eveningOut),
        record.totalHours?.toFixed(2) || '0.00',
        record.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `attendance_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">Loading attendance records...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Attendance Records</span>
            </CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={exportToCSV} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {attendance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No attendance records found for the selected period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Morning In</TableHead>
                    <TableHead>Morning Out</TableHead>
                    <TableHead>Afternoon In</TableHead>
                    <TableHead>Afternoon Out</TableHead>
                    <TableHead>Evening In</TableHead>
                    <TableHead>Evening Out</TableHead>
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((record) => (
                    <TableRow key={record._id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{formatTime(record.morningIn)}</TableCell>
                      <TableCell>{formatTime(record.morningOut)}</TableCell>
                      <TableCell>{formatTime(record.afternoonIn)}</TableCell>
                      <TableCell>{formatTime(record.afternoonOut)}</TableCell>
                      <TableCell>{formatTime(record.eveningIn)}</TableCell>
                      <TableCell>{formatTime(record.eveningOut)}</TableCell>
                      <TableCell className="font-medium">{record.totalHours?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {attendance.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-lg font-bold">{attendance.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Present Days</p>
                  <p className="text-lg font-bold text-green-600">
                    {attendance.filter(a => a.status === 'present').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Late Days</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {attendance.filter(a => a.status === 'late').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Hours</p>
                  <p className="text-lg font-bold text-[#003366]">
                    {attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
