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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Total Chunks</CardTitle>
          {/* Replace with your actual icon component */}
          <CuboidIcon className="w-6 h-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{totalChunks}</div>
          <p className="text-muted-foreground">
            <span className="font-medium">+5.2%</span> from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Available Chunks</CardTitle>
          {/* Replace with your actual icon component */}
          <CuboidIcon className="w-6 h-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{availableChunks}</div>
          <p className="text-muted-foreground">
            <span className="font-medium">+3.1%</span> from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Reserved Chunks</CardTitle>
          {/* Replace with your actual icon component */}
          <CuboidIcon className="w-6 h-6 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{reservedChunks}</div>
          <p className="text-muted-foreground">
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
