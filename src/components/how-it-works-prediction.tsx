"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader, BrainCircuit, FileJson } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getImageEmbedding } from "@/ai/flows/get-image-embedding";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sampleImages = [
  { id: 'cat1', src: 'https://picsum.photos/id/219/300/200', alt: 'A fluffy cat', dataAiHint: 'cat' },
  { id: 'dog1', src: 'https://picsum.photos/id/237/300/200', alt: 'A black puppy', dataAiHint: 'dog' },
  { id: 'cat2', src: 'https://picsum.photos/id/1074/300/200', alt: 'A cat yawning', dataAiHint: 'cat' },
  { id: 'dog2', src: 'https://picsum.photos/id/568/300/200', alt: 'A dog in a field', dataAiHint: 'dog' },
];

async function imageUrlToDataUrl(url: string): Promise<string> {
  const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function HowItWorksPrediction() {
  const [selectedImage, setSelectedImage] = useState<(typeof sampleImages)[0] | null>(null);
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = async (image: (typeof sampleImages)[0]) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setEmbedding(null);
    setSelectedImage(image);

    try {
      const photoDataUri = await imageUrlToDataUrl(image.src);
      const embeddingResult = await getImageEmbedding({ photoDataUri });
      setEmbedding(embeddingResult.embedding);
    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis Failed",
        description: "Could not generate an embedding for the image. Please try another one.",
        variant: "destructive",
      });
      setSelectedImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Generate an Embedding Vector</CardTitle>
        <CardDescription>See how an AI model converts an image into a list of numbers—an "embedding"—that represents its features.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">1. Select an image to process</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sampleImages.map((image) => (
              <button
                key={image.id}
                className={cn(
                  "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                  selectedImage?.id === image.id ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent hover:border-primary/50",
                  isLoading && selectedImage?.id !== image.id && "cursor-not-allowed opacity-50"
                )}
                onClick={() => handleImageSelect(image)}
                disabled={isLoading && selectedImage?.id !== image.id}
              >
                <Image src={image.src} alt={image.alt} fill className="object-cover" data-ai-hint={image.dataAiHint}/>
                {selectedImage?.id === image.id && isLoading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader className="w-8 h-8 animate-spin text-primary"/>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary"/> 2. Generated Embedding Vector
            </h3>
            <div className="p-6 bg-secondary/30 rounded-lg min-h-[200px] flex items-center justify-center font-mono text-sm relative">
                {isLoading && (
                    <div className="text-center text-muted-foreground">
                        <Loader className="w-8 h-8 animate-spin text-primary mb-2 mx-auto" />
                        <p>Generating embedding...</p>
                    </div>
                )}
                {!isLoading && !embedding && (
                     <p className="text-center text-muted-foreground">Select an image to see its embedding vector.</p>
                )}
                {embedding && (
                    <div className="w-full h-48 overflow-y-auto bg-background/50 p-4 rounded-md">
                        <p className="break-all select-all text-muted-foreground">
                           [{embedding.map(n => n.toFixed(4)).join(', ')}]
                        </p>
                    </div>
                )}
            </div>
            {embedding && (
                <p className="text-xs text-muted-foreground text-center">This is a long list of numbers ({embedding.length} dimensions) that the AI uses to understand the content of the image.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
