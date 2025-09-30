import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WelcomeBanner() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-0">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Welcome back, John!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-100 text-lg">Today is {currentDate}</p>
        <p className="text-blue-200 mt-2">
          Ready to manage your academic schedule? Check your upcoming classes
          and exam timetable.
        </p>
      </CardContent>
    </Card>
  );
}
