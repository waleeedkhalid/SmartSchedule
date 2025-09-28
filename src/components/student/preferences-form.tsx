"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export function PreferencesForm() {
  const [preferences, setPreferences] = useState({
    preferredTimes: "",
    maxCourses: 5,
    difficultyLevel: "medium",
  })
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would call an API endpoint here
    console.log("Submitting preferences:", preferences)
    
    // Example of updating search params
    const params = new URLSearchParams(searchParams.toString())
    params.set('updated', new Date().toISOString())
    router.push(`?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="preferredTimes">Preferred Times</Label>
        <Input
          id="preferredTimes"
          value={preferences.preferredTimes}
          onChange={(e) =>
            setPreferences({ ...preferences, preferredTimes: e.target.value })
          }
          placeholder="e.g., Morning, Afternoon, Evening"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="maxCourses">Maximum Number of Courses</Label>
        <Input
          id="maxCourses"
          type="number"
          min="1"
          max="8"
          value={preferences.maxCourses}
          onChange={(e) =>
            setPreferences({ ...preferences, maxCourses: parseInt(e.target.value) })
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Difficulty Level</Label>
        <div className="flex items-center space-x-4">
          {["Easy", "Medium", "Hard"].map((level) => (
            <label key={level} className="flex items-center space-x-2">
              <input
                type="radio"
                name="difficulty"
                checked={preferences.difficultyLevel === level.toLowerCase()}
                onChange={() =>
                  setPreferences({ ...preferences, difficultyLevel: level.toLowerCase() })
                }
                className="h-4 w-4 text-primary"
              />
              <span>{level}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Save Preferences</Button>
      </div>
    </form>
  )
}
