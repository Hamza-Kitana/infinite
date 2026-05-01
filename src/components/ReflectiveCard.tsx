import { Button } from "@/components/ui/button";
import "./ReflectiveCard.css";

type ReflectiveCardProps = {
  name: string;
  role: string;
  bio: string;
  image: string;
  streamUrl: string;
  featured?: boolean;
};

const ReflectiveCard = ({ name, role, bio, image, streamUrl, featured = false }: ReflectiveCardProps) => {
  return (
    <article className={`reflective-card ${featured ? "reflective-card--featured" : "reflective-card--lite"}`}>
      <img src={image} alt={name} className="reflective-card__bg" loading="lazy" decoding="async" />
      <div className="reflective-card__overlay" />

      <div className="reflective-card__content">
        <div className="reflective-card__body">
          <div className="reflective-card__avatar-wrap">
            <img src={image} alt={name} className="reflective-card__avatar" loading="lazy" decoding="async" />
          </div>
          <p className="reflective-card__role">{role}</p>
          <h3 className="reflective-card__name">{name}</h3>
          <p className="reflective-card__bio">{bio}</p>
        </div>

        <footer className="reflective-card__footer">
          <Button asChild className="w-full bg-gradient-neon text-primary-foreground font-display tracking-widest">
            <a href={streamUrl} target="_blank" rel="noreferrer">
              رابط البث
            </a>
          </Button>
        </footer>
      </div>
    </article>
  );
};

export default ReflectiveCard;
