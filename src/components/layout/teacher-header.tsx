type TeacherHeaderProps = {
  title: string;
  description: string;
};

export function TeacherHeader({ title, description }: TeacherHeaderProps) {
  return (
    <header className="bg-card border-b p-4 md:p-6">
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </header>
  );
}
