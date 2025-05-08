'use client';

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { NonceRecord } from "../mock-data";
import { ChevronDown, Filter, BarChart2, ArrowLeftRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface SidebarProps {
  nonceData: NonceRecord[];
}

interface CategoryProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
}

function Category({ title, children, icon, defaultOpen = false }: CategoryProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border-b border-gray-200 py-2">
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1 pb-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function CheckboxGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{title}</p>
      {items.map((item) => (
        <div key={item} className="flex items-center space-x-2">
          <Checkbox id={item.replace(/\s+/g, '-').toLowerCase()} />
          <Label htmlFor={item.replace(/\s+/g, '-').toLowerCase()} className="text-sm">
            {item}
          </Label>
        </div>
      ))}
    </div>
  );
}

export function Sidebar({ nonceData }: SidebarProps) {
  return (
    <div className="w-full border-r border-gray-200 p-4 h-[calc(100vh-8rem)] overflow-y-auto">
      <div className="space-y-1">
        <div className="pb-2 mb-2">
          <h3 className="text-base font-medium">Hashing</h3>
        </div>
        
        <Category 
          title="Measure" 
          icon={<BarChart2 className="h-4 w-4" />}
          defaultOpen={true}
        >
          <div className="space-y-4">
            <CheckboxGroup 
              title="Finance" 
              items={["Cost (USD)", "Earning (BTC)", "Earning (USD)", "Margin"]} 
            />
            <CheckboxGroup 
              title="Operation" 
              items={["Hashrate", "Online Hashrate", "Online Efficiency", "Online Miners", "Offline Miners"]} 
            />
          </div>
        </Category>
        
        <Category 
          title="Breakdown" 
          icon={<ArrowLeftRight className="h-4 w-4" />}
        >
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="farm-name" />
              <Label htmlFor="farm-name" className="text-sm">Farm Name</Label>
            </div>
          </div>
        </Category>
        
        <Category 
          title="Filter" 
          icon={<Filter className="h-4 w-4" />}
        >
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Farm Name</p>
            <div className="space-y-1">
              {["GA - LN", "Kuching - MY", "Paris - TN"].map((farm) => (
                <div key={farm} className="flex items-center space-x-2">
                  <Checkbox id={`farm-${farm.replace(/\s+/g, '-').toLowerCase()}`} />
                  <Label 
                    htmlFor={`farm-${farm.replace(/\s+/g, '-').toLowerCase()}`} 
                    className="text-sm"
                  >
                    {farm}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </Category>
        
        <Category 
          title="Compare" 
          icon={<ArrowLeftRight className="h-4 w-4" />}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="previous-period" />
                <Label htmlFor="previous-period" className="text-sm">Previous Period</Label>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Moving Average</p>
              <div className="space-y-1">
                {["7D MA", "28D MA"].map((period) => (
                  <div key={period} className="flex items-center space-x-2">
                    <Checkbox id={`ma-${period.replace(/\s+/g, '-').toLowerCase()}`} />
                    <Label 
                      htmlFor={`ma-${period.replace(/\s+/g, '-').toLowerCase()}`} 
                      className="text-sm"
                    >
                      {period}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Reference Line</p>
              <div className="space-y-1">
                {["Max", "Min", "Average"].map((line) => (
                  <div key={line} className="flex items-center space-x-2">
                    <Checkbox id={`ref-${line.toLowerCase()}`} />
                    <Label 
                      htmlFor={`ref-${line.toLowerCase()}`} 
                      className="text-sm"
                    >
                      {line}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Category>
      </div>
    </div>
  );
}
