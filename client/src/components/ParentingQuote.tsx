import { Quote } from "lucide-react";

const PARENTING_QUOTES = [
  { text: "There is no such thing as a perfect parent. So just be a real one.", author: "Sue Atkins" },
  { text: "Children are not things to be molded, but are people to be unfolded.", author: "Jess Lair" },
  { text: "To be in your children's memories tomorrow, you have to be in their lives today.", author: "Barbara Johnson" },
  { text: "Your children will become what you are; so be what you want them to be.", author: "David Bly" },
  { text: "Each day of our lives we make deposits in the memory banks of our children.", author: "Charles R. Swindoll" },
  { text: "The way we talk to our children becomes their inner voice.", author: "Peggy O'Mara" },
  { text: "It is time for parents to teach young people that in diversity there is beauty and there is strength.", author: "Maya Angelou" },
  { text: "Children learn more from what you are than what you teach.", author: "W.E.B. Du Bois" },
  { text: "Behind every young child who believes in themselves is a parent who believed first.", author: "Matthew L. Jacobson" },
  { text: "The best way to make children good is to make them happy.", author: "Oscar Wilde" },
  { text: "While we try to teach our children all about life, our children teach us what life is all about.", author: "Angela Schwindt" },
  { text: "Don't worry that children never listen to you; worry that they are always watching you.", author: "Robert Fulghum" },
  { text: "Children are apt to live up to what you believe of them.", author: "Lady Bird Johnson" },
  { text: "You can learn many things from children. How much patience you have, for instance.", author: "Franklin P. Jones" },
  { text: "If you want your children to turn out well, spend twice as much time with them, and half as much money.", author: "Abigail Van Buren (Dear Abby)" },
  { text: "The most important thing that parents can teach their children is how to get along without them.", author: "Frank A. Clark" },
  { text: "The sign of great parenting is not the child's behavior. The sign of great parenting is the parent's behavior.", author: "Andy Smithson" },
  { text: "A child seldom needs a good talking to as a good listening to.", author: "Robert Brault" },
  { text: "What it's like to be a parent: It's one of the hardest things you'll ever do but in exchange it teaches you the meaning of unconditional love.", author: "Nicholas Sparks" },
  { text: "There's no way to be a perfect parent and a million ways to be a good one.", author: "Jill Churchill" },
  { text: "At the end of the day, the most overwhelming key to a child's success is the positive involvement of parents.", author: "Jane D. Hull" },
  { text: "Encourage and support your kids because children are apt to live up to what you believe of them.", author: "Lady Bird Johnson" },
  { text: "Love your children unconditionally, but hold them accountable for their actions.", author: "Kevin Heath" },
  { text: "Parenting isn't a practice. It's a daily learning experience.", author: "B. D. Schiers" },
  { text: "What good mothers and fathers instinctively feel like doing for their babies is usually best after all.", author: "Benjamin Spock" },
  { text: "If we are to teach real peace in this world, we shall have to begin with the children.", author: "Mahatma Gandhi" },
  { text: "In raising my children, I have lost my mind but found my soul.", author: "Lisa T. Shepherd" },
  { text: "Children spell love T-I-M-E.", author: "Dr. Anthony P. Witham" },
  { text: "There are no seven wonders of the world in the eyes of a child. There are seven million.", author: "Walt Streightiff" },
  { text: "Be the parent today that you want your kids to remember tomorrow.", author: "Kevin Heath" }
];

export const ParentingQuote = () => {
  // Get a random quote each time the component renders
  const randomQuote = PARENTING_QUOTES[Math.floor(Math.random() * PARENTING_QUOTES.length)];

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
          <Quote className="h-6 w-6 text-green-500" />
        </div>
      </div>
      <blockquote className="text-gray-200 text-lg leading-relaxed mb-4 italic">
        "{randomQuote.text}"
      </blockquote>
      <cite className="text-green-400 font-medium">
        — {randomQuote.author}
      </cite>
    </div>
  );
};