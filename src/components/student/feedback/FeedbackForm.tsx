"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

export function FeedbackForm() {
  const [satisfaction, setSatisfaction] = useState(3);
  const [timing, setTiming] = useState(3);
  const [availability, setAvailability] = useState(3);
  const [comments, setComments] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      satisfaction,
      timing,
      availability,
      comments
    });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Thank You!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your feedback has been submitted successfully.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Feedback</CardTitle>
        <p className="text-sm text-muted-foreground">
          Please share your thoughts about the proposed schedule
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="satisfaction" className="block mb-2">
              Overall satisfaction with the schedule: <strong>{satisfaction}/5</strong>
            </Label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">1 (Poor)</span>
              <Slider
                id="satisfaction"
                min={1}
                max={5}
                step={1}
                value={[satisfaction]}
                onValueChange={([value]) => setSatisfaction(value)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">5 (Excellent)</span>
            </div>
          </div>

          <div>
            <Label htmlFor="timing" className="block mb-2">
              How well do the class timings work for you? <strong>{timing}/5</strong>
            </Label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">1 (Poor)</span>
              <Slider
                id="timing"
                min={1}
                max={5}
                step={1}
                value={[timing]}
                onValueChange={([value]) => setTiming(value)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">5 (Excellent)</span>
            </div>
          </div>

          <div>
            <Label htmlFor="availability" className="block mb-2">
              Availability of your preferred courses: <strong>{availability}/5</strong>
            </Label>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">1 (Poor)</span>
              <Slider
                id="availability"
                min={1}
                max={5}
                step={1}
                value={[availability]}
                onValueChange={([value]) => setAvailability(value)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">5 (Excellent)</span>
            </div>
          </div>

          <div>
            <Label htmlFor="comments" className="block mb-2">
              Additional comments or concerns:
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Please provide any additional feedback..."
              rows={4}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Submit Feedback</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default FeedbackForm;


