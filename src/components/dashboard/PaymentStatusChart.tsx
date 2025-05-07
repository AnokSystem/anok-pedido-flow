
import { Card } from "@/components/ui/card";
import { PaymentStatus } from "@/types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatarCurrency } from "@/lib/utils";

interface PaymentStatusChartProps {
  data: {
    status: PaymentStatus;
    count: number;
    valor: number;
  }[];
}

const COLORS = ['#c8e6c9', '#ffccbc', '#ffecb3'];
const RADIAN = Math.PI / 180;

export function PaymentStatusChart({ data }: PaymentStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.valor, 0);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="shadow-sm p-4">
      <h3 className="text-sm font-medium mb-4">Status de Pagamento</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="valor"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [formatarCurrency(value as number), 'Valor']}
              labelFormatter={(index) => data[index].status}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {data.map((entry, index) => (
          <div key={entry.status} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-1" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs">{entry.status} ({entry.count}) - {formatarCurrency(entry.valor)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
