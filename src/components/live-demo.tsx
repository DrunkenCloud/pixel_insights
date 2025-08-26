"use client";

import { useState, useRef, type FormEvent } from "react";
import Image from "next/image";
import { UploadCloud, X, Loader, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { predictImageClass, type PredictImageClassOutput } from "@/ai/flows/predict-image-class";

const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export function LiveDemo() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictImageClassOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }
    resetState();
    setImageFile(file);
    const preview = await readFileAsDataURL(file);
    setImagePreview(preview);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!imageFile) {
      toast({
        title: "No Image",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const photoDataUri = await readFileAsDataURL(imageFile);
      const result = await predictImageClass({ photoDataUri });
      setPrediction(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Prediction Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setImageFile(null);
    setImagePreview(null);
    setPrediction(null);
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const confidencePercentage = prediction ? Math.round(prediction.confidence * 100) : 0;

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Live Classification Demo</CardTitle>
        <CardDescription>Upload an image of a cat or a dog and see the AI's prediction in real-time.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-4">
            {!imagePreview && (
              <div
                className="relative w-full aspect-video border-2 border-dashed border-muted-foreground/50 rounded-lg flex flex-col justify-center items-center text-center p-8 cursor-pointer hover:border-primary hover:bg-accent/20 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <UploadCloud className="w-12 h-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-semibold">Click or drag & drop to upload</p>
                <p className="text-sm text-muted-foreground">PNG, JPG, or WEBP</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
              </div>
            )}
            
            {imagePreview && (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border shadow-sm">
                <Image src={imagePreview} alt="Uploaded preview" fill className="object-cover" />
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10" onClick={resetState}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <Button onClick={handleSubmit} disabled={!imageFile || isLoading || !!prediction} size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Classifying...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Classify Image
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-col justify-center min-h-[300px] bg-secondary/30 p-6 rounded-lg">
            {isLoading && (
              <div className="text-center">
                <Loader className="mx-auto h-12 w-12 text-primary animate-spin" />
                <p className="mt-4 text-lg font-semibold">Analyzing Image...</p>
                <p className="text-muted-foreground">Our AI is taking a close look.</p>
              </div>
            )}
            
            {!isLoading && !prediction && (
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-semibold">Awaiting Image</p>
                <p>Your prediction results will appear here.</p>
              </div>
            )}

            {prediction && (
              <div className="flex flex-col items-center text-center gap-4">
                <p className="text-muted-foreground">Prediction</p>
                <h3 className="text-6xl font-bold text-primary">{prediction.prediction}</h3>
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-muted-foreground">Confidence</span>
                    <span className="text-sm font-bold text-primary">{confidencePercentage}%</span>
                  </div>
                  <Progress value={confidencePercentage} className="w-full h-3" />
                </div>
                <Button onClick={resetState} variant="outline" className="mt-4">
                  Try another image
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
