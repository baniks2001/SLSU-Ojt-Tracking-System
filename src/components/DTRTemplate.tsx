'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Printer, Download, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DTRTemplateProps {
  student: {
    _id: string;
    studentId: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    course: string;
    department: string;
    hostEstablishment: string;
    shiftType: 'regular' | 'graveyard' | 'custom';
    location?: string; // Optional
  };
}

interface AttendanceRecord {
  date: string;
  morningIn?: string;
  morningOut?: string;
  afternoonIn?: string;
  afternoonOut?: string;
  eveningIn?: string;
  eveningOut?: string;
  totalHours: number;
  undertimeMinutes: number;
}

export default function DTRTemplate({ student }: DTRTemplateProps) {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAttendance();
  }, [student._id, selectedMonth, selectedYear]);

  const fetchAttendance = async () => {
    try {
      const response = await fetch(`/api/attendance?studentId=${student._id}&month=${selectedMonth}&year=${selectedYear}`);
      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance || []);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate().toString();
  };

  const getMonthYearLabel = () => {
    const date = new Date(selectedYear, selectedMonth - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  const getDaysInMonth = () => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  };

  const getAttendanceForDay = (day: number) => {
    const dateStr = new Date(selectedYear, selectedMonth - 1, day).toISOString().split('T')[0];
    return attendance.find(a => new Date(a.date).toISOString().split('T')[0] === dateStr);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const originalContents = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>DTR - ${student.firstName} ${student.lastName}</title>
            <style>
              @media print {
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .dtr-container { width: 100%; max-width: 800px; margin: 0 auto; }
                .dtr-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .dtr-table th, .dtr-table td { 
                  border: 1px solid #000; 
                  padding: 6px 4px; 
                  text-align: center;
                }
                .dtr-table th { background-color: #f0f0f0; font-weight: bold; }
                .dtr-header { text-align: center; margin-bottom: 20px; }
                .dtr-header h1 { font-size: 16px; margin: 0; font-weight: bold; }
                .dtr-header h2 { font-size: 14px; margin: 5px 0; }
                .dtr-header p { font-size: 12px; margin: 3px 0; }
                .dtr-footer { margin-top: 30px; font-size: 11px; }
                .signature-section { display: flex; justify-content: space-between; margin-top: 40px; }
                .signature-box { width: 45%; }
                .signature-line { border-top: 1px solid #000; margin-top: 30px; padding-top: 5px; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  };

  const handleDownloadPDF = () => {
    toast.info('PDF download feature coming soon. Use Print to PDF for now.');
    handlePrint();
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

  const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Daily Time Record (DTR)</span>
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

              <div className="flex space-x-2">
                <Button variant="outline" onClick={handlePrint} size="sm">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" onClick={handleDownloadPDF} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* DTR Template Display */}
          <div ref={printRef} className="dtr-container border p-6 bg-white">
            {/* Header */}
            <div className="dtr-header text-center mb-4">
              <p className="text-sm font-semibold">Civil Service Form No. 48</p>
              <h1 className="text-lg font-bold mb-1">DAILY TIME RECORD</h1>
              <p className="text-xs mb-4">-o0o-</p>
              <h2 className="text-base font-bold border-b-2 border-black inline-block px-8 py-1 mb-2">
                {fullName.toUpperCase()}
              </h2>
              <p className="text-xs">(Name)</p>
            </div>

            {/* Month and Office Hours Info */}
            <div className="flex justify-between items-center mb-4 text-sm">
              <div>
                <span className="font-semibold">For the month of </span>
                <span className="border-b border-black px-4 font-bold">{getMonthYearLabel()}</span>
              </div>
              <div className="text-center">
                <p className="font-semibold">Official hours for arrival</p>
                <p>and departure</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">Regular days</p>
                <p>_______________</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">Saturdays</p>
                <p>_______________</p>
              </div>
            </div>

            {/* DTR Table */}
            <table className="dtr-table w-full border-collapse border border-black text-xs">
              <thead>
                <tr className="bg-gray-100">
                  <th rowSpan={2} className="border border-black p-2 w-12">Day</th>
                  <th colSpan={2} className="border border-black p-2">A.M.</th>
                  <th colSpan={2} className="border border-black p-2">P.M.</th>
                  <th colSpan={2} className="border border-black p-2">Undertime</th>
                </tr>
                <tr className="bg-gray-100">
                  <th className="border border-black p-1">Arrival</th>
                  <th className="border border-black p-1">Departure</th>
                  <th className="border border-black p-1">Arrival</th>
                  <th className="border border-black p-1">Departure</th>
                  <th className="border border-black p-1">Hours</th>
                  <th className="border border-black p-1">Minutes</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: getDaysInMonth() }, (_, i) => {
                  const day = i + 1;
                  const record = getAttendanceForDay(day);
                  
                  return (
                    <tr key={day}>
                      <td className="border border-black p-1 text-center font-medium">{day}</td>
                      <td className="border border-black p-1 text-center">
                        {record?.morningIn ? formatTime(record.morningIn) : ''}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {record?.morningOut ? formatTime(record.morningOut) : ''}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {record?.afternoonIn ? formatTime(record.afternoonIn) : ''}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {record?.afternoonOut ? formatTime(record.afternoonOut) : ''}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {record?.undertimeMinutes ? Math.floor(record.undertimeMinutes / 60) : ''}
                      </td>
                      <td className="border border-black p-1 text-center">
                        {record?.undertimeMinutes ? (record.undertimeMinutes % 60) : ''}
                      </td>
                    </tr>
                  );
                })}
                {/* Total Row */}
                <tr className="bg-gray-50 font-bold">
                  <td colSpan={5} className="border border-black p-1 text-right pr-4">
                    Total
                  </td>
                  <td colSpan={2} className="border border-black p-1 text-center">
                    {attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0).toFixed(2)} hrs
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Certification Text */}
            <div className="mt-4 text-xs">
              <p className="italic">
                I certify on my honor that the above is a true and correct report of the hours of work performed, 
                record of which was made daily at the time of arrival and departure from office.
              </p>
            </div>

            {/* Signature Section */}
            <div className="mt-8">
              <div className="text-xs mb-2">
                <p className="font-semibold uppercase">VERIFIED as to the prescribed office hours:</p>
              </div>
              
              <div className="flex justify-between mt-8">
                <div className="w-1/2 pr-8">
                  <div className="border-t border-black pt-1 text-center">
                    <p className="text-xs font-bold uppercase">In Charge</p>
                  </div>
                </div>
                <div className="w-1/2 pl-8">
                  {/* Empty space for second signature if needed */}
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 text-center">
              <p className="text-xs">(SEE INSTRUCTION ON BACK)</p>
            </div>

            {/* Form Code */}
            <div className="mt-4 text-center">
              <p className="text-xs font-bold">HRDD-EXT-008 rev0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
