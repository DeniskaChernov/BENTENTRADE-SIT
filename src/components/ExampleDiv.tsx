import { CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowRight } from '../utils/lucide-stub';

export function ExampleDiv() {
  return (
    <CardContent className="p-8 text-center">
      <h3 className="text-xl font-semibold mb-4 text-foreground">
        Хотите попасть в нашу галерею?
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Поделитесь фотографией своего проекта с нашими кашпо, и мы разместим её в галерее!
      </p>
      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
        Прислать фото проекта
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </CardContent>
  );
}