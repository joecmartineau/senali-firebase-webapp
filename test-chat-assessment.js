// Simulate a real parent conversation to test assessment extraction

console.log("🎭 SIMULATION: Parent Chat with Senali");
console.log("=" + "=".repeat(48));

const chatConversation = [
  {
    role: "parent",
    message: "Hi Senali, I'm really struggling with my 8-year-old son Alex. He just can't seem to focus in school and his teacher says he's constantly disrupting the class.",
    extractedInfo: {
      childName: "Alex",
      age: 8,
      symptoms: {
        adhd: {
          failsToPayAttention: "often",
          disruptingClass: "problematic"
        }
      }
    }
  },
  {
    role: "parent", 
    message: "Alex loses his homework almost every day and can't sit still during dinner. He fidgets with everything and talks constantly.",
    extractedInfo: {
      childName: "Alex",
      symptoms: {
        adhd: {
          losesThings: "very_often",
          fidgetsWithHandsOrFeet: "very_often",
          talksExcessively: "very_often"
        }
      }
    }
  },
  {
    role: "parent",
    message: "He interrupts everyone when they're talking and can't wait his turn in games. The teacher says he blurts out answers before she finishes the question.",
    extractedInfo: {
      childName: "Alex", 
      symptoms: {
        adhd: {
          interruptsOrIntrudes: "very_often",
          difficultyWaitingTurn: "often",
          blurtsOutAnswers: "often"
        }
      }
    }
  },
  {
    role: "parent",
    message: "I also have concerns about my 6-year-old daughter Sarah. She doesn't make eye contact and seems to prefer playing by herself rather than with other kids.",
    extractedInfo: {
      childName: "Sarah",
      age: 6,
      symptoms: {
        autism: {
          nonverbalCommunication: "moderate",
          developingMaintainingRelationships: "moderate"
        }
      }
    }
  },
  {
    role: "parent",
    message: "Sarah has very specific routines and gets extremely upset if anything changes. She also repeats phrases from TV shows and rocks back and forth when she's excited.",
    extractedInfo: {
      childName: "Sarah",
      symptoms: {
        autism: {
          insistenceOnSameness: "severe",
          stereotypedRepetitiveMotor: "moderate"
        }
      }
    }
  }
];

console.log("\n📱 CHAT SIMULATION");
console.log("-".repeat(50));

chatConversation.forEach((exchange, index) => {
  console.log(`\n💬 Parent Message ${index + 1}:`);
  console.log(`"${exchange.message}"`);
  
  console.log(`\n🔍 Assessment Processor Extracts:`);
  console.log(`   Child: ${exchange.extractedInfo.childName}`);
  if (exchange.extractedInfo.age) {
    console.log(`   Age: ${exchange.extractedInfo.age}`);
  }
  
  Object.entries(exchange.extractedInfo.symptoms).forEach(([condition, symptoms]) => {
    console.log(`   ${condition.toUpperCase()} Symptoms:`);
    Object.entries(symptoms).forEach(([symptom, severity]) => {
      console.log(`     • ${symptom}: ${severity}`);
    });
  });
});

console.log("\n📊 ASSESSMENT PROFILES BUILT");
console.log("-".repeat(50));

console.log(`\n🧠 Alex's ADHD Profile:`);
console.log(`   Inattention Symptoms: 2/9 identified`);
console.log(`   Hyperactivity Symptoms: 4/9 identified`);
console.log(`   Academic Performance: Problematic`);
console.log(`   Status: Moderate likelihood - monitor and consider evaluation`);

console.log(`\n🤝 Sarah's Autism Profile:`);
console.log(`   Social Communication: 2/3 areas identified`);
console.log(`   Restricted Behaviors: 2/4 areas identified`);
console.log(`   Status: Moderate likelihood - continue observation`);

console.log("\n✨ SENALI'S RESPONSE INTEGRATION");
console.log("-".repeat(50));
console.log(`
When parents ask "Do you think Alex might have ADHD?", Senali can now respond:

"Based on our conversations, I've observed several patterns in Alex's behavior that align with ADHD criteria:

📋 Inattention indicators:
• Difficulty focusing (mentioned frequently)
• Loses homework/items (daily occurrence)

📋 Hyperactivity indicators:  
• Excessive fidgeting and talking
• Difficulty sitting still
• Interrupts and can't wait turn
• Blurts out answers

These observations suggest it would be valuable to discuss ADHD evaluation with Alex's pediatrician. I can help you prepare specific examples and questions for that conversation.

Would you like me to help you document these patterns for your doctor's appointment?"

This approach:
✅ Uses professional diagnostic criteria
✅ Provides specific behavioral examples
✅ Encourages medical consultation
✅ Offers practical next steps
✅ Never makes diagnoses
`);

console.log("\n🎯 SYSTEM BENEFITS");
console.log("-".repeat(50));
console.log("• Parents get professional-grade insights from casual conversations");
console.log("• Each child has a separate, comprehensive assessment profile");
console.log("• Real diagnostic criteria (DSM-5, Vanderbilt, ADOS/ADI-R) guide scoring");
console.log("• Parents become informed advocates for their children");
console.log("• Smooth transition from support chat to actionable medical information");