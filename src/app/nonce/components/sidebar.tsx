'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { NonceRecord } from "../mock-data";

interface SidebarProps {
  nonceData: NonceRecord[];
  summaryData: {
    totalEarning: number;
    totalCost: number;
    profit: number;
  };
}

export function Sidebar({ nonceData, summaryData }: SidebarProps) {
  return (
    <div className="w-72">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Period</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">From:</span>
                <span>{nonceData[0]?.period}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">To:</span>
                <span>{nonceData[nonceData.length - 1]?.period}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Earnings:</span>
                <span>{summaryData.totalEarning.toFixed(4)} BTC</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Total Cost:</span>
                <span>${summaryData.totalCost.toFixed(2)} USD</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Profit:</span>
                <span className={summaryData.profit > 0 ? "text-green-600" : "text-red-600"}>
                  {summaryData.profit.toFixed(4)} BTC
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hashrate">Hashrate</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="hashrate">
                    <SelectValue placeholder="Select hashrate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="online">Online Hashrate</SelectItem>
                    <SelectItem value="offline">Offline Hashrate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="efficiency">Efficiency</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="efficiency">
                    <SelectValue placeholder="Select efficiency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="high">High ({'>'}80%)</SelectItem>
                    <SelectItem value="medium">Medium (60-80%)</SelectItem>
                    <SelectItem value="low">Low ({'<'}60%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="miners">Miners</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="miners">
                    <SelectValue placeholder="Select miners" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Miners</SelectItem>
                    <SelectItem value="online">Online Miners</SelectItem>
                    <SelectItem value="offline">Offline Miners</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
