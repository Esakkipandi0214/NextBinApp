import React from 'react';
import { BarChart, CartesianGrid, XAxis, Bar, LineChart, Line, PieChart, Pie } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className }) => {
  return (
    <div className={`${className} grid gap-8 grid-cols-1 sm:grid-cols-3`}>
      {/* Returning Customers */}
      <Card className="overflow-hidden shadow-xl border border-gray-200 bg-transparent">
        <CardHeader className="bg-blue-100 bg-transparent">
          <CardTitle className="text-white">Returning Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              returningCustomers: {
                label: "Returning Customers",
                color: "hsl(var(--chart-1))",
              },
            }}
          >
            <BarChart
              accessibilityLayer
              data={[
                { month: "January", returningCustomers: 45 },
                { month: "February", returningCustomers: 78 },
                { month: "March", returningCustomers: 62 },
                { month: "April", returningCustomers: 35 },
                { month: "May", returningCustomers: 90 },
                { month: "June", returningCustomers: 85 },
              ]}
            >
              <CartesianGrid vertical={false} stroke="#e0f7fa" />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="returningCustomers" fill="hsl(200, 70%, 50%)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card className="overflow-hidden shadow-xl border border-gray-200 bg-transparent">
        <CardHeader className="bg-green-100 bg-transparent">
          <CardTitle className="text-white">Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              sessions: {
                label: "Sessions",
                color: "hsl(var(--chart-2))",
              },
            }}
          >
            <LineChart
              accessibilityLayer
              data={[
                { month: "January", sessions: 153 },
                { month: "February", sessions: 210 },
                { month: "March", sessions: 175 },
                { month: "April", sessions: 120 },
                { month: "May", sessions: 260 },
                { month: "June", sessions: 240 },
              ]}
            >
              <CartesianGrid vertical={false} stroke="#e8f5e9" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Line dataKey="sessions" type="natural" stroke="hsl(160, 70%, 50%)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Total Sales */}
      <Card className="overflow-hidden shadow-xl border border-gray-200 bg-transparent">
        <CardHeader className="bg-red-100 bg-transparent">
          <CardTitle className=" text-white">Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              totalSales: {
                label: "Total Sales",
                color: "hsl(var(--chart-3))",
              },
            }}
          >
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={[
                  { month: "January", totalSales: 780, fill: "hsl(120, 70%, 50%)" },
                  { month: "February", totalSales: 980, fill: "hsl(240, 70%, 50%)" },
                  { month: "March", totalSales: 850, fill: "hsl(300, 70%, 50%)" },
                  { month: "April", totalSales: 720, fill: "hsl(30, 70%, 50%)" },
                  { month: "May", totalSales: 1100, fill: "hsl(210, 70%, 50%)" },
                  { month: "June", totalSales: 1050, fill: "hsl(45, 70%, 50%)" },
                ]}
                dataKey="totalSales"
                nameKey="month"
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
