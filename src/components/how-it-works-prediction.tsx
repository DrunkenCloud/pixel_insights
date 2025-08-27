"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { generateAttentionMap, type GenerateAttentionMapOutput } from "@/ai/flows/generate-attention-map";
import { cn } from "@/lib/utils";

const sampleImages = [
  { id: 'cat1', src: 'https://picsum.photos/id/219/200/300', alt: 'A fluffy cat', dataAiHint: 'cat' },
  { id: 'dog1', src: 'https://picsum.photos/id/237/200/300', alt: 'A black puppy', dataAiHint: 'dog' },
  { id: 'cat2', src: 'https://picsum.photos/id/1074/200/300', alt: 'A cat yawning', dataAiHint: 'cat' },
  { id: 'dog2', src: 'https://picsum.photos/id/568/200/300', alt: 'A dog in a field', dataAiHint: 'dog' },
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
  const [result, setResult] = useState<GenerateAttentionMapOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = async (image: (typeof sampleImages)[0]) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setResult(null);
    setSelectedImage(image);

    try {
      const photoDataUri = await imageUrlToDataUrl(image.src);
      const mapResult = await generateAttentionMap({ photoDataUri });
      setResult(mapResult);
    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis Failed",
        description: "Could not generate attention map. Please try another image.",
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
        <CardTitle className="text-2xl font-headline">Prediction & Attention Maps</CardTitle>
        <CardDescription>See what parts of an image the AI focuses on to make its decision.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">1. Select an image</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {sampleImages.map((image) => (
              <button
                key={image.id}
                className={cn(
                  "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                  selectedImage?.id === image.id ? "border-primary ring-2 ring-primary ring-offset-2" : "border-transparent hover:border-primary/50",
                  isLoading && "cursor-not-allowed opacity-50"
                )}
                onClick={() => handleImageSelect(image)}
                disabled={isLoading}
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

        <div className="grid md:grid-cols-2 gap-8 items-center min-h-[400px]">
            <div className="relative w-full aspect-video rounded-lg bg-secondary/30 flex items-center justify-center text-muted-foreground">
                {!selectedImage ? (
                  <p>Select an image to see the attention map</p>
                ) : (
                    <>
                        <Image src={selectedImage.src} alt={selectedImage.alt} fill className="object-contain rounded-lg" data-ai-hint={selectedImage.dataAiHint}/>
                        {result?.attentionMapDataUri && (
                            <Image 
                                src={result.attentionMapDataUri} 
                                alt="Attention map" 
                                fill 
                                className="object-contain rounded-lg opacity-60 mix-blend-screen"
                                data-ai-hint="heatmap overlay"
                            />
                        )}
                         {isLoading && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                                <Loader className="w-12 h-12 animate-spin text-primary"/>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2"><Eye className="w-5 h-5 text-primary"/> 2. Analyze the Results</h3>
              {result ? (
                <div className="p-6 bg-secondary/30 rounded-lg space-y-4">
                  <p className="text-sm text-muted-foreground">The AI predicted:</p>
                  <p className="text-4xl font-bold text-primary">{result.prediction}</p>
                  <p className="text-sm text-muted-foreground">with <span className="font-bold text-foreground">{Math.round(result.confidence * 100)}%</span> confidence.</p>
                  <p className="text-sm text-muted-foreground">The highlighted areas on the image show the features the model found most important for its decision. This is called an "attention map".</p>
                </div>
              ) : (
                <div className="p-6 bg-secondary/30 rounded-lg text-center text-muted-foreground min-h-[200px] flex flex-col justify-center">
                   {isLoading ? <p>Generating attention map...</p> : <p>Results will be displayed here.</p>}
                </div>
              )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
