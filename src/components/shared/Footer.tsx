import { Github, Linkedin } from "lucide-react";

export interface TeamMember {
  name: string;
  github: string;
  linkedin: string;
}

interface FooterProps {
  team?: TeamMember[];
  className?: string;
}

export function Footer({ team, className = "" }: FooterProps) {
  const defaultTeam: TeamMember[] = [
    {
      name: "Abdullah Alsuhaibani",
      github: "https://github.com/Abdullah-0S",
      linkedin: "https://www.linkedin.com/in/abdullahalsuhaibani/",
    },
    {
      name: "Sulaiman Mokhaniq",
      github: "https://github.com/sulaimanmokhaniq",
      linkedin: "https://www.linkedin.com/in/sulaiman-mokhaniq/",
    },
    {
      name: "Waleeed Khalid",
      github: "https://github.com/waleeedkhalid",
      linkedin: "https://www.linkedin.com/in/w4leedkhalid",
    },
    {
      name: "Hamza Hamdi",
      github: "https://github.com/hamza808111",
      linkedin: "https://www.linkedin.com/in/hamza-hamdi-48b316157/",
    },
    {
      name: "Abderraouf Bendjedia",
      github: "https://github.com/Abderraouf17",
      linkedin: "https://linkedin.com/in/abderraouf-bendjedia",
    },
  ];

  const teamMembers = team || defaultTeam;

  return (
    <footer className={`border-t bg-muted/30 py-8 px-8 ${className}`}>
      <div className="max-w-4xl mx-auto text-center">
        <h3 className="text-foreground text-lg font-semibold mb-6">Made by:</h3>
        <div className="flex flex-wrap justify-center gap-6">
          {teamMembers.map((member) => (
            <div key={member.name} className="flex items-center gap-3">
              <span className="text-foreground/90 text-base">
                {member.name}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary transition-colors flex items-center"
                  title={`${member.name}'s GitHub`}
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0A66C2] hover:opacity-80 transition-opacity flex items-center"
                  title={`${member.name}'s LinkedIn`}
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
