"use client"

import * as React from "react"
import { FileDropzone } from "@/components/shared/file-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider" // Need to check if I have Slider, otherwise use input range
import { getDocument, extractTextFromPDF } from "@/lib/pdf-client"
import { Play, Pause, RotateCcw, FastForward, Rewind } from "lucide-react"
import { toast } from "sonner"

export default function RSVPReaderPage() {
  const [words, setWords] = React.useState<string[]>([])
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [wpm, setWpm] = React.useState(300)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleDrop = async (files: File[]) => {
    const droppedFile = files[0]
    setIsLoading(true)
    
    try {
      const buffer = await droppedFile.arrayBuffer()
      const loadingTask = getDocument({ data: buffer })
      const pdf = await loadingTask.promise
      const extractedWords = await extractTextFromPDF(pdf)
      
      if (extractedWords.length === 0) {
        toast.error("No text found in PDF. Scanned PDFs need OCR first.")
        return
      }
      
      setWords(extractedWords)
      setCurrentIndex(0)
      setIsPlaying(false)
    } catch (error) {
      console.error(error)
      toast.error("Failed to extract text.")
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentIndex < words.length) {
      const delay = 60000 / wpm
      interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= words.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, delay)
    }
    return () => clearInterval(interval)
  }, [isPlaying, wpm, words.length, currentIndex])

  const togglePlay = () => setIsPlaying(!isPlaying)
  const reset = () => {
    setIsPlaying(false)
    setCurrentIndex(0)
  }
  
  const currentWord = words[currentIndex] || ""
  
  // Highlight center character (ORP - Optimal Recognition Point)
  const renderWord = (word: string) => {
    if (!word) return null
    const center = Math.floor(word.length / 2)
    const left = word.slice(0, center)
    const middle = word[center]
    const right = word.slice(center + 1)
    
    return (
      <div className="flex items-baseline text-5xl font-bold md:text-7xl">
        <span className="text-foreground">{left}</span>
        <span className="text-primary">{middle}</span>
        <span className="text-foreground">{right}</span>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Speed Reader (RSVP)
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Read PDFs faster using Rapid Serial Visual Presentation.
          </p>
        </div>

        {words.length === 0 ? (
          <FileDropzone
            onDrop={handleDrop}
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={1}
            title="Open PDF to Read"
            description="Extract text and speed read. (Text-based PDFs only)"
          />
        ) : (
          <div className="space-y-8">
            <Card className="border-2">
              <CardContent className="flex h-[300px] flex-col items-center justify-center p-6 text-center">
                {isLoading ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                ) : (
                  <div className="relative">
                     {/* Guides */}
                     <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-muted-foreground/10" />
                     <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 translate-y-[0.1em] h-[0.8em] border-t-2 border-b-2 border-primary/20" />
                     
                     {renderWord(currentWord)}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-6">
                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{currentIndex + 1} / {words.length} words</span>
                        <span>{Math.round(((currentIndex + 1) / words.length) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div 
                            className="h-full bg-primary transition-all duration-100 ease-linear" 
                            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }} 
                        />
                    </div>
                     <input 
                        type="range" 
                        min="0" 
                        max={words.length - 1} 
                        value={currentIndex} 
                        onChange={(e) => {
                            setIsPlaying(false)
                            setCurrentIndex(parseInt(e.target.value))
                        }}
                        className="w-full accent-primary"
                     />
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={reset}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setCurrentIndex(c => Math.max(0, c - 10))}>
                            <Rewind className="h-4 w-4" />
                        </Button>
                        <Button 
                            size="icon" 
                            className="h-14 w-14 rounded-full" 
                            onClick={togglePlay}
                        >
                            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setCurrentIndex(c => Math.min(words.length-1, c + 10))}>
                            <FastForward className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex w-full max-w-sm items-center gap-4">
                        <span className="text-sm font-medium">Speed:</span>
                        <div className="flex-1">
                            <input 
                                type="range" 
                                min="100" 
                                max="1000" 
                                step="50" 
                                value={wpm} 
                                onChange={(e) => setWpm(parseInt(e.target.value))}
                                className="w-full accent-primary"
                            />
                        </div>
                        <span className="w-16 text-right text-sm font-medium">{wpm} WPM</span>
                    </div>
                </div>
            </div>
            
            <div className="text-center">
                 <Button variant="ghost" className="text-muted-foreground" onClick={() => setWords([])}>
                    Open different file
                 </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
