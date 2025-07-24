# Professional Assessment System Demo

## Overview
Senali now includes a comprehensive diagnostic assessment system that builds professional profiles for each child mentioned in conversations. This system uses real diagnostic criteria from medical professionals.

## How It Works

### 1. Background Processing
When parents chat with Senali, the system automatically:
- Extracts child names from conversations
- Identifies symptoms and behaviors mentioned
- Updates standardized assessment forms in the background
- Builds diagnostic profiles over time

### 2. Professional Assessment Forms

#### ADHD Assessment (Based on Vanderbilt + DSM-5)
- **Inattention Symptoms** (9 criteria): attention, focus, listening, following instructions, organization, homework avoidance, losing things, distractibility, forgetfulness
- **Hyperactivity/Impulsivity** (9 criteria): fidgeting, staying seated, excessive running/climbing, difficulty with quiet activities, "on the go", excessive talking, blurting answers, waiting turn, interrupting
- **Performance Areas**: Academic performance, peer relationships, following directions, classroom disruption, assignment completion

#### Autism Assessment (Based on DSM-5 + ADOS/ADI-R)
- **Social Communication Deficits** (3 required): social-emotional reciprocity, nonverbal communication, developing/maintaining relationships
- **Restricted/Repetitive Behaviors** (2 of 4 required): stereotyped motor movements, insistence on sameness, restricted interests, sensory reactivity
- **Development History**: Early concerns, language development, social milestones

#### ODD Assessment (Based on DSM-5)
- **Angry/Irritable Mood**: loses temper, easily annoyed, angry/resentful
- **Argumentative/Defiant**: argues with authority, defies rules, deliberately annoys, blames others
- **Vindictiveness**: spiteful or vindictive behavior
- **Context**: Duration, settings affected, severity level

### 3. Smart Symptom Extraction

The system recognizes natural language patterns:

**Example Conversations:**
- "Alex has trouble paying attention in class" → Updates ADHD inattention score
- "Sarah doesn't make eye contact and prefers playing alone" → Updates autism social communication
- "Emma argues with teachers and loses her temper often" → Updates ODD argumentative behavior

**Severity Mapping:**
- "never" → 0 points
- "sometimes/occasionally" → 1 point  
- "often/frequently" → 2 points
- "very often/always" → 3 points

### 4. Assessment Insights Generation

When parents ask about patterns or request insights, Senali can provide:

#### ADHD Insights
- Inattention score: X/9 symptoms
- Hyperactivity score: X/9 symptoms
- Likelihood: High/Moderate/Low (based on 6+ symptoms threshold)
- Recommendations for professional evaluation

#### Autism Insights
- Social communication concerns: X/3 areas
- Restricted behavior concerns: X/4 areas
- Likelihood based on DSM-5 criteria (all 3 social + 2 of 4 restricted)
- Developmental considerations

#### ODD Insights
- Total symptom score: X/8 behaviors
- Likelihood based on 4+ symptom threshold
- Duration and setting information

## Example Assessment Report

```
Child Profile: Alex (Age 8)

🧠 ADHD Assessment Results:
├─ Inattention Score: 6/9 (HIGH)
│  ├─ Difficulty paying attention: Often
│  ├─ Doesn't follow instructions: Often  
│  ├─ Easily distracted: Very Often
│  └─ Forgetful in daily activities: Often
├─ Hyperactivity Score: 7/9 (HIGH)
│  ├─ Fidgets with hands/feet: Very Often
│  ├─ Difficulty sitting still: Often
│  └─ Talks excessively: Often
└─ Recommendation: Meets criteria for professional ADHD evaluation

📊 Academic Performance: Somewhat problematic
📊 Peer Relationships: Average
📊 Following Directions: Problematic

⚠️  Professional Consultation Recommended:
Share these observations with pediatrician or child psychologist.
Consider comprehensive ADHD evaluation including psychological testing.
```

## API Endpoints

### Assessment Summary
```
GET /api/assessments/child/:childName/summary
```
Returns raw assessment data for a specific child.

### Assessment Insights  
```
GET /api/assessments/child/:childName/insights
```
Returns processed insights with recommendations.

## Database Schema

The system maintains separate tables for:
- **child_profiles**: Basic child information
- **adhd_assessments**: 18 ADHD symptoms + performance areas
- **autism_assessments**: DSM-5 autism criteria + development history
- **odd_assessments**: 8 ODD symptoms + context information

## Ethical Safeguards

1. **Never Diagnoses**: Only provides observational insights
2. **Professional Referral**: Always recommends medical consultation
3. **Parental Empowerment**: Helps parents become informed advocates
4. **Evidence-Based**: Uses only validated diagnostic criteria
5. **Privacy Protected**: Data stored securely, child names protected

## Benefits for Parents

- **Comprehensive Tracking**: Systematic observation of all behaviors
- **Professional Communication**: Structured insights for medical discussions
- **Early Recognition**: Identification of patterns over time
- **Informed Advocacy**: Better preparation for healthcare appointments
- **Multiple Conditions**: Simultaneous tracking of ADHD, Autism, ODD

This system transforms casual conversations into valuable diagnostic insights while maintaining appropriate boundaries and encouraging professional consultation.