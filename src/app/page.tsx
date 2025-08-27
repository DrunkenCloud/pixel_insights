import { Cpu } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveDemo } from "@/components/live-demo";
import { HowItWorksTraining } from "@/components/how-it-works-training";
import { HowItWorksPrediction } from "@/components/how-it-works-prediction";

export default function Home() {
  return (
    <div className="flex flex-col min-h-dvh bg-background font-body">
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Cpu className="w-10 h-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold font-headline text-primary">Pixel Insights</h1>
            <p className="text-muted-foreground">Demystifying AI Image Classification</p>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto py-8 px-4">
        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
            <TabsTrigger value="demo" className="py-2 sm:py-1.5">Live Demo</TabsTrigger>
            <TabsTrigger value="training" className="py-2 sm:py-1.5">How It Works: Training</TabsTrigger>
            <TabsTrigger value="prediction" className="py-2 sm:py-1.5">How It Works: Embeddings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="demo" className="mt-6">
            <LiveDemo />
          </TabsContent>
          
          <TabsContent value="training" className="mt-6">
            <HowItWorksTraining />
          </TabsContent>

          <TabsContent value="prediction" className="mt-6">
            <HowItWorksPrediction />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="py-4">
          <p className="text-center text-sm text-muted-foreground">
              Built with Next.js and Genkit.
          </p>
      </footer>
    </div>
  );
}
