---
id: math-001
section: math
topic: Scientific Notation
difficulty: easy
answer: c
estimated_time: 60
review_status: approved
---

## Question
The value of $(\frac{4}{5} \times 10^{-4}) + (\frac{18}{4} \times 10^{-3})$ is?

## Choices
A. 0.053
B. 0.00125
C. 0.00458
D. 0.00053

## Explanation
Convert both to the same exponent ($10^{-4}$):
$18/4 = 4.5$
$4.5 \times 10^{-3} = 45 \times 10^{-4}$
Now add: $(\frac{4}{5}) + 45 = 0.8 + 45 = 45.8$
So, $45.8 \times 10^{-4} = 0.00458$.

===

---
id: math-002
section: math
topic: Rational Expressions
difficulty: medium
answer: c
estimated_time: 90
review_status: approved
---

## Question
For $x \neq -1$ and $x \neq -\frac{3}{2}$, which of the following is equivalent to $\frac{x + 1}{(2x + 3)(x + 1)^2}$?

## Choices
A. $\frac{(x + 1)^2}{2x + 3}$
B. $\frac{1}{2x + 3}$
C. $\frac{1}{(2x + 3)(x + 1)}$
D. $\frac{1}{x + 2}$

## Explanation
Cancel out the common factor of $(x + 1)$ from the numerator and denominator:
$\frac{x + 1}{(2x + 3)(x + 1)(x + 1)} = \frac{1}{(2x + 3)(x + 1)}$.

===

---
id: math-003
section: math
topic: Work & Rate Problems
difficulty: medium
answer: a
estimated_time: 90
review_status: approved
---

## Question
Archie can eat a meal in 30 minutes. Jughead can eat the same meal in 10 minutes. How long (in minutes) will it take them to eat the meal together?

## Choices
A. 7.5
B. 20
C. 1/20
D. 1/30

## Explanation
Archie's rate = $1/30$ of a meal per minute.
Jughead's rate = $1/10$ of a meal per minute.
Combined rate = $1/30 + 1/10 = 1/30 + 3/30 = 4/30$ of a meal per minute.
Time taken = $1 / (\text{combined rate}) = \frac{30}{4} = 7.5$ minutes.

===

---
id: math-004
section: math
topic: Linear Equations
difficulty: easy
answer: a
estimated_time: 90
review_status: approved
---

## Question
In Beloy’s fish ball factory, it costs 25 pesos to make 15 pieces of fishball while it costs 40 pesos to make 27 pieces. Assuming that the total cost is described by a linear function, how much does it cost to make 19 pieces of fishball?

## Choices
A. 30
B. 31
C. 32
D. 33

## Explanation
We can find the equation of the line passing through points (15, 25) and (27, 40). 
Slope $m = \frac{40 - 25}{27 - 15} = \frac{15}{12} = \frac{5}{4} = 1.25$.
Using point-slope form: $y - 25 = 1.25(x - 15)$
For $x = 19$: $y - 25 = 1.25(19 - 15)$
$y - 25 = 1.25(4)$
$y - 25 = 5$
$y = 30$.

===

---
id: math-005
section: math
topic: Polynomials & Functions
difficulty: medium
answer: c
estimated_time: 90
review_status: approved
---

## Question
Given $f(x) = 4x^3 + 2x - 6$, where one of the three roots is $x = 1$, which of the following statements is true?

## Choices
A. The other two roots are real and unequal.
B. The other two roots are real and equal.
C. The other two roots are not real.
D. The graph of $f(x)$ will not intersect the x-axis at all.

## Explanation
Divide $4x^3 + 2x - 6$ by $(x - 1)$ to get the quadratic factor $4x^2 + 4x + 6$.
To find its roots, calculate the discriminant ($b^2 - 4ac$):
$(4)^2 - 4(4)(6) = 16 - 96 = -80$.
Since the discriminant is negative, the other two roots are complex/not real.

===

---
id: math-006
section: math
topic: Circles & Inscribed Angles
difficulty: medium
answer: a
estimated_time: 60
review_status: approved
diagram_alt: A circle with center O and points A, B, and C connected to show the given angles.
---

## Question
Let points $A$, $B$, and $C$ lie on a circle with center at point $O$. If angle $BAC$ is of measure $x^\circ$, then what is the measure of angle $CBO$?

## Choices
A. $90^\circ - x^\circ$
B. $90^\circ + x^\circ$
C. $180^\circ - x^\circ$
D. $x^\circ$

## Explanation
The inscribed angle $BAC$ is $x^\circ$. The central angle subtending the same arc $BC$ is angle $BOC$. Therefore, angle $BOC = 2x^\circ$. 
Triangle $BOC$ is an isosceles triangle because $OB$ and $OC$ are radii of the circle.
The sum of angles in triangle $BOC$ is $180^\circ$. 
Therefore, $2 \times \text{angle } CBO + \text{angle } BOC = 180^\circ$.
$2 \times \text{angle } CBO + 2x^\circ = 180^\circ$.
$\text{angle } CBO = 90^\circ - x^\circ$.

## Diagram
{
  "kind": "circle-inscribed-angle",
  "labels": {
    "center": "O",
    "pointA": "A",
    "pointB": "B",
    "pointC": "C",
    "inscribedAngle": "x°",
    "centralAngle": "2x°",
    "targetAngle": "∠CBO = ?"
  }
}

===

---
id: math-007
section: math
topic: Parallel Lines & Angles
difficulty: hard
answer: b
estimated_time: 90
review_status: approved
diagram_alt: Two parallel lines cut by a transversal with angles labeled 3x degrees and x plus 40 degrees.
---

## Question
Two parallel lines are cut by a transversal. The two same-side interior (co-interior) angles formed measure $(3x)^\circ$ and $(x + 40)^\circ$. What is the measure of the larger of these two angles?

## Choices
A. $75^\circ$
B. $105^\circ$
C. $115^\circ$
D. $135^\circ$

## Explanation
Same-side interior angles between parallel lines are supplementary, so they add to $180^\circ$:
$3x + (x + 40) = 180 \Rightarrow 4x + 40 = 180 \Rightarrow x = 35$.
The two angles are $3x = 105^\circ$ and $x + 40 = 75^\circ$. The larger is $105^\circ$.

## Diagram
{
  "kind": "parallel-lines-transversal",
  "labels": {
    "angleA": "3x°",
    "angleB": "x + 40°"
  }
}

===

---
id: math-008
section: math
topic: Area & Similarity
difficulty: hard
answer: b
estimated_time: 90
review_status: approved
diagram_alt: Two triangles labeled ABC and DEF with corresponding sides AB equals 6 and DE equals 9.
---

## Question
Triangles $ABC$ and $DEF$ are similar, with side $AB$ corresponding to side $DE$. If $AB = 6$, $DE = 9$, and the area of triangle $ABC$ is $24$ square units, what is the area of triangle $DEF$?

## Choices
A. 16
B. 54
C. 36
D. 81

## Explanation
For similar triangles, the ratio of areas equals the square of the ratio of corresponding sides:
$\frac{\text{area } DEF}{\text{area } ABC} = \left(\frac{DE}{AB}\right)^2 = \left(\frac{9}{6}\right)^2 = \frac{9}{4}$.
So area $DEF = 24 \times \frac{9}{4} = 54$ square units.

## Diagram
{
  "kind": "similar-triangles",
  "left": {
    "name": "ABC",
    "sideLabel": "AB = 6",
    "areaLabel": "Area = 24"
  },
  "right": {
    "name": "DEF",
    "sideLabel": "DE = 9",
    "areaLabel": "Area = ?"
  }
}

===

---
id: math-009
section: math
topic: Data Interpretation
difficulty: easy
answer: c
estimated_time: 60
review_status: approved
diagram_alt: A figure comparing Restaurant X and Restaurant Y profits in April and May.
---

## Question
The profits (in thousand pesos) of Restaurants X and Y are as follows: in April, X earned 30 and Y earned 40; in May, X earned 40 and Y earned 50. Which of the following is a correct comparison of the total profit of Restaurants X and Y, from April to May?

## Choices
A. The total profit of X is equal to that of Y.
B. The total profit of Y is less than that of X.
C. The total profit of Y is 20,000 greater than that of X.
D. The total profit of Y is 10,000 greater than that of X.

## Explanation
Total profit of X (April + May) = $30 + 40 = 70$.
Total profit of Y (April + May) = $40 + 50 = 90$.
Difference = $90 - 70 = 20$ thousand pesos = $20,000$.

## Diagram
{
  "kind": "grouped-bar-chart",
  "yLabel": "Profit (thousand pesos)",
  "categories": ["April", "May"],
  "series": [
    { "label": "Restaurant X", "values": [30, 40] },
    { "label": "Restaurant Y", "values": [40, 50] }
  ]
}

===

---
id: math-010
section: math
topic: Basic Probability
difficulty: medium
answer: b
estimated_time: 60
review_status: approved
diagram_alt: A two-way table showing smokers and non-smokers by male and female counts.
---

## Question
In a barangay, a survey was conducted to determine the number of 18-year old youths who smoke. 
Smokers: Male=25, Female=11. 
Non-Smokers: Male=75, Female=89. 
What is the probability that a randomly chosen 18-year old male of the barangay is a smoker?

## Choices
A. 1/8
B. 1/4
C. 1/2
D. 3/4

## Explanation
The condition is "a randomly chosen 18-year old MALE". 
Total males = $25 \text{ (smokers)} + 75 \text{ (non-smokers)} = 100$.
Male smokers = 25.
Probability = $25 / 100 = 1/4$.

## Diagram
{
  "kind": "two-way-table",
  "rowHeaders": ["Smokers", "Non-smokers"],
  "columnHeaders": ["Male", "Female"],
  "values": [
    [25, 11],
    [75, 89]
  ],
  "highlight": {
    "column": "Male"
  }
}

===

---
id: math-011
section: math
topic: Counting Principles
difficulty: medium
answer: a
estimated_time: 60
review_status: approved
---

## Question
A store plans to display its 5 new products. However, there are only 3 display windows and each window can hold only one product at a time. A set of three products will be displayed for a day and the store has 8 days to showcase all sets of three products. Which of the following is true?
I. The store will not be able to display all sets of three products within 8 days.
II. The store will be able to display all sets of three products in less than 8 days.
III. The store will be able to display all sets of three products in exactly 8 days.

## Choices
A. I only
B. II only
C. III only
D. II and III only

## Explanation
The number of ways to choose 3 products out of 5 is a combination: $C(5,3) = \frac{5!}{3!2!} = 10$ sets.
Since they only have 8 days, and they display one set per day, they can only display 8 sets. Therefore, they will not be able to display all 10 sets within 8 days.

===

---
id: math-012
section: math
topic: Deductive Reasoning
difficulty: medium
answer: a
estimated_time: 60
review_status: approved
---

## Question
All clowns are funny. Some mascots are not funny. Which of the following can be validly concluded from the statements?

## Choices
A. Some mascots are not clowns.
B. Some clowns are not mascots.
C. No mascot is a clown.
D. All mascots are clowns.

## Explanation
Since all clowns are funny, anything that is not funny cannot be a clown. The mascots that are not funny therefore cannot be clowns, so "Some mascots are not clowns" (A) must be true. B, C, and D may or may not be true, but none of them follows necessarily from the premises.
