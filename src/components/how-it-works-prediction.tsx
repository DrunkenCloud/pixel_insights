"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader, Eye, Cat, Dog } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { detectObjects, type DetectObjectsOutput } from "@/ai/flows/detect-objects";
import { cn } from "@/lib/utils";

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
  const [result, setResult] = useState<DetectObjectsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageSelect = async (image: (typeof sampleImages)[0]) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setResult(null);
    setSelectedImage(image);

    try {
      const photoDataUri = await imageUrlToDataUrl(image.src);
      const detectionResult = await detectObjects({ photoDataUri });
      setResult(detectionResult);
    } catch (error) {
      console.error(error);
      toast({
        title: "Analysis Failed",
        description: "Could not detect objects in the image. Please try another one.",
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
        <CardTitle className="text-2xl font-headline">Object Detection</CardTitle>
        <CardDescription>See how an AI model identifies objects and draws bounding boxes around them.</CardDescription>
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
                  <p>Select an image to see the detected objects</p>
                ) : (
                    <>
                        <Image src={selectedImage.src} alt={selectedImage.alt} fill className="object-contain rounded-lg" data-ai-hint={selectedImage.dataAiHint}/>
                        {result?.objects?.map((obj, index) => {
                          const [x_min, y_min, x_max, y_max] = obj.box;
                          return (
                            <div
                              key={index}
                              className={cn(
                                "absolute border-2 rounded-sm",
                                obj.label === 'Dog' ? 'border-accent' : 'border-primary'
                              )}
                              style={{
                                left: `${x_min * 100}%`,
                                top: `${y_min * 100}%`,
                                width: `${(x_max - x_min) * 100}%`,
                                height: `${(y_max - y_min) * 100}%`,
                              }}
                            >
                               <div className={cn(
                                "absolute -top-7 left-0 text-xs font-bold px-1.5 py-0.5 rounded-t-sm",
                                obj.label === 'Dog' ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'
                               )}>
                                {obj.label} ({Math.round(obj.confidence * 100)}%)
                               </div>
                            </div>
                          );
                        })}
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
                    {result.objects.length > 0 ? (
                        <>
                          <p className="text-sm text-muted-foreground">The AI found <span className="font-bold text-foreground">{result.objects.length}</span> object(s):</p>
                          <ul className="space-y-3">
                            {result.objects.map((obj, i) => (
                              <li key={i} className="flex items-center gap-4 text-lg">
                                {obj.label === 'Dog' ? <Dog className="w-6 h-6 text-accent" /> : <Cat className="w-6 h-6 text-primary" />}
                                <span className={cn('font-bold', obj.label === 'Dog' ? 'text-accent' : 'text-primary')}>{obj.label}</span>
                                <span className="text-sm text-muted-foreground">({Math.round(obj.confidence * 100)}% confidence)</span>
                              </li>
                            ))}
                          </ul>
                          <p className="text-sm text-muted-foreground pt-4">The colored boxes on the image show where the model detected each object.</p>
                        </>
                    ) : (
                        <p className="text-center text-muted-foreground">No cats or dogs were detected in this image.</p>
                    )}
                </div>
              ) : (
                <div className="p-6 bg-secondary/30 rounded-lg text-center text-muted-foreground min-h-[200px] flex flex-col justify-center">
                   {isLoading ? <p>Detecting objects...</p> : <p>Results will be displayed here.</p>}
                </div>
              )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
