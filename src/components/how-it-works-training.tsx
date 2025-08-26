"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BrainCircuit, Shapes, Image as ImageIcon, FileJson, Target } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const trainingData = [
  { epoch: 1, accuracy: 55, loss: 1.2 },
  { epoch: 2, accuracy: 62, loss: 0.9 },
  { epoch: 3, accuracy: 71, loss: 0.7 },
  { epoch: 4, accuracy: 78, loss: 0.5 },
  { epoch: 5, accuracy: 85, loss: 0.35 },
  { epoch: 6, accuracy: 92, loss: 0.2 },
  { epoch: 7, accuracy: 96, loss: 0.1 },
  { epoch: 8, accuracy: 98, loss: 0.05 },
];

const chartConfig = {
  accuracy: {
    label: "Accuracy",
    color: "hsl(var(--primary))",
  },
  loss: {
    label: "Loss",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

const imageDataset = [
    { src: 'https://picsum.photos/seed/paws1/200/200', label: 'Cat', hint: 'cat' },
    { src: 'https://picsum.photos/seed/paws2/200/200', label: 'Dog', hint: 'dog' },
    { src: 'https://picsum.photos/seed/paws3/200/200', label: 'Dog', hint: 'dog' },
    { src: 'https://picsum.photos/seed/paws4/200/200', label: 'Cat', hint: 'cat' },
    { src: 'https://picsum.photos/seed/paws5/200/200', label: 'Cat', hint: 'cat' },
    { src: 'https://picsum.photos/seed/paws6/200/200', label: 'Dog', hint: 'dog' },
    { src: 'https://picsum.photos/seed/paws7/200/200', label: 'Cat', hint: 'cat' },
    { src: 'https://picsum.photos/seed/paws8/200/200', label: 'Dog', hint: 'dog' },
];

export function HowItWorksTraining() {
  return (
    <div className="space-y-12">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">1. Labeled Data: The Foundation</CardTitle>
          <CardDescription>AI models learn from examples. For image classification, we need a large dataset of images that have already been labeled by humans.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                {imageDataset.map((img, i) => (
                    <div key={i} className="space-y-2 text-center">
                        <div className="aspect-square rounded-lg overflow-hidden border shadow-sm">
                            <Image src={img.src} alt={img.label} width={200} height={200} className="object-cover" data-ai-hint={img.hint} />
                        </div>
                        <Badge variant={img.label === 'Cat' ? 'default' : 'secondary'}>{img.label}</Badge>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">2. Embeddings: Turning Images into Numbers</CardTitle>
          <CardDescription>Computers don't "see" images like we do. An image is converted into an "embedding"—a long list of numbers that represents its key features.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8 p-8">
            <div className="flex flex-col items-center gap-2">
                <ImageIcon className="w-16 h-16 text-primary" />
                <p className="font-semibold">Original Image</p>
                <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-primary shadow-md">
                   <Image src="https://picsum.photos/seed/embeddingcat/200/200" alt="Cat for embedding" width={200} height={200} data-ai-hint="cat" />
                </div>
            </div>
            <ArrowRight className="w-12 h-12 text-muted-foreground shrink-0 rotate-90 md:rotate-0" />
            <div className="flex flex-col items-center gap-2">
                <FileJson className="w-16 h-16 text-primary" />
                <p className="font-semibold">Embedding Vector</p>
                <div className="w-48 h-48 p-2 bg-secondary/50 rounded-lg font-mono text-xs overflow-hidden relative">
                    <p className="break-all">[0.23, -0.45, 1.32, 0.01, -0.87, 0.55, 0.99, -1.1, 0.62, 0.17, -0.33, 2.1, 0.04, -0.7, 0.48, 1.05, -0.21, 0.88, ...]</p>
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-secondary/50 to-transparent"></div>
                </div>
            </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">3. The Training Loop</CardTitle>
          <CardDescription>The model repeatedly guesses, checks its error (loss), and adjusts its internal parameters to get better. This cycle is run millions of times.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="flex flex-wrap items-center justify-center gap-4 text-center">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30"><ImageIcon className="w-8 h-8 text-primary"/><span>Input Image</span></div>
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30"><BrainCircuit className="w-8 h-8 text-primary"/><span>Model Guesses</span></div>
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30"><Target className="w-8 h-8 text-primary"/><span>Calculate Loss</span></div>
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
                <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30"><Shapes className="w-8 h-8 text-primary"/><span>Adjust Weights</span></div>
            </div>
            
            <ChartContainer config={chartConfig} className="w-full h-[300px]">
                <ResponsiveContainer>
                    <LineChart data={trainingData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="epoch" tickLine={false} axisLine={false} tickMargin={8} label={{ value: 'Training Epochs', position: 'insideBottom', offset: -15 }} />
                    <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={8} label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={8} label={{ value: 'Loss', angle: -90, position: 'insideRight' }} />
                    <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                    <Line yAxisId="left" dataKey="accuracy" type="natural" stroke="var(--color-accuracy)" strokeWidth={2} dot={false} />
                    <Line yAxisId="right" dataKey="loss" type="natural" stroke="var(--color-loss)" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
