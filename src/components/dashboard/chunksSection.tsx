import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CuboidIcon } from 'lucide-react';

interface ChunkStatisticsProps {
  totalChunks: number;
  availableChunks: number;
  reservedChunks: number;
}

const ChunkStatistics: React.FC<ChunkStatisticsProps> = ({
  totalChunks,
  availableChunks,
  reservedChunks,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-blue-700">Total Chunks</CardTitle>
          <CuboidIcon className="w-6 h-6 text-blue-700" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-blue-700">{totalChunks}</div>
          <p className="text-blue-600">
            <span className="font-medium">+5.2%</span> from last month
          </p>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-green-700">Available Chunks</CardTitle>
          <CuboidIcon className="w-6 h-6 text-green-700" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-700">{availableChunks}</div>
          <p className="text-green-600">
            <span className="font-medium">+3.1%</span> from last month
          </p>
        </CardContent>
      </Card>

      <Card className="bg-red-50 border-red-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-red-700">Reserved Chunks</CardTitle>
          <CuboidIcon className="w-6 h-6 text-red-700" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-red-700">{reservedChunks}</div>
          <p className="text-red-600">
            <span className="font-medium">+2.7%</span> from last month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

// Example static data for demonstration
ChunkStatistics.defaultProps = {
  totalChunks: 100,
  availableChunks: 75,
  reservedChunks: 25,
};

export default ChunkStatistics;
