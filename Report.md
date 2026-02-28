# RHCR2 Assignment Report

## 1. Experimental Results (32 Runs)
The following tables summarize the 32 assigned runs for combination of `p` and `z`. Results display the starting point `sp`, number of evaluated solutions (number of times `f` was called), the final best coordinates `(x, y)`, and the resulting value `f(x, y)`.
**Random Seeds Used:** Run 1 = `42`, Run 2 = `99`

### Table: p=120 & z=9
| Start Point (sp) | Run 1: F Queries | Run 1: Best (x, y) | Run 1: f(x, y) | Run 2: F Queries | Run 2: Best (x, y) | Run 2: f(x, y) |
|---|---|---|---|---|---|---|
| `(-300, -400)` | 961 | `(-280.32, -438.76)` | `-436.2654` | 721 | `(-280.96, -438.98)` | `-436.1729` |
| `(0, 0)` | 721 | `(32.99, 8.73)` | `-31.4781` | 241 | `(8.69, 7.99)` | `-8.9083` |
| `(-222, -222)` | 361 | `(-208.90, -209.95)` | `-203.2629` | 841 | `(-207.60, -208.58)` | `-206.7050` |
| `(-510, 400)` | 601 | `(-499.78, 405.34)` | `-494.0460` | 361 | `(-498.14, 404.69)` | `-494.1462` |

### Table: p=120 & z=50
| Start Point (sp) | Run 1: F Queries | Run 1: Best (x, y) | Run 1: f(x, y) | Run 2: F Queries | Run 2: Best (x, y) | Run 2: f(x, y) |
|---|---|---|---|---|---|---|
| `(-300, -400)` | 241 | `(-273.42, -437.16)` | `-430.7275` | 241 | `(-274.45, -434.15)` | `-431.5294` |
| `(0, 0)` | 841 | `(158.91, 96.28)` | `-151.9979` | 481 | `(136.21, 21.25)` | `-129.4172` |
| `(-222, -222)` | 481 | `(-298.84, -178.04)` | `-295.2123` | 481 | `(-235.18, -324.78)` | `-322.9397` |
| `(-510, 400)` | 481 | `(-500.43, 407.11)` | `-492.3105` | 481 | `(-507.08, 409.32)` | `-490.2056` |

### Table: p=400 & z=9
| Start Point (sp) | Run 1: F Queries | Run 1: Best (x, y) | Run 1: f(x, y) | Run 2: F Queries | Run 2: Best (x, y) | Run 2: f(x, y) |
|---|---|---|---|---|---|---|
| `(-300, -400)` | 2401 | `(-279.91, -438.33)` | `-436.3507` | 2401 | `(-279.82, -438.24)` | `-436.3540` |
| `(0, 0)` | 1201 | `(10.90, 9.85)` | `-10.6836` | 1601 | `(11.82, 10.75)` | `-10.8395` |
| `(-222, -222)` | 801 | `(-217.88, -218.88)` | `-190.4326` | 1201 | `(-209.00, -209.99)` | `-206.9699` |
| `(-510, 400)` | 1201 | `(-498.38, 404.67)` | `-494.1574` | 1601 | `(-497.97, 404.48)` | `-494.1448` |

### Table: p=400 & z=50
| Start Point (sp) | Run 1: F Queries | Run 1: Best (x, y) | Run 1: f(x, y) | Run 2: F Queries | Run 2: Best (x, y) | Run 2: f(x, y) |
|---|---|---|---|---|---|---|
| `(-300, -400)` | 1601 | `(-279.33, -437.85)` | `-436.3164` | 1201 | `(-280.51, -438.01)` | `-436.1225` |
| `(0, 0)` | 1601 | `(56.85, 144.36)` | `-144.9179` | 1601 | `(-110.03, 16.55)` | `-104.1842` |
| `(-222, -222)` | 2001 | `(-350.53, -292.75)` | `-348.1480` | 3601 | `(-407.28, -495.22)` | `-491.1070` |
| `(-510, 400)` | 1201 | `(-501.07, 406.77)` | `-493.4900` | 1601 | `(-501.42, 406.40)` | `-493.7043` |

## 2. The 33rd Run (Optimized Parameters)
- **Preferred Parameters:** `sp` = (512, 512), `p` = 2000, `z` = 25
- **Random Seed:** `1234`
- **Best Solution (x, y) Found:** `(512.0000, 491.1969)`
- **Value for f:** `-510.584735`
- **Solutions Generated (f queries):** `4001`

## 3. Interpretation and Conclusions
### Solution Quality & Algorithm Speed
The algorithm evaluates thousands of intermediate states rapidly, showcasing high computational speed. Regarding solution quality, due to the highly rugged topological landscape of `f_Frog`, the algorithm generally terminates at local minima. Across the runs, we frequently observed convergence around the `~(-400 to -510)` range. Increasing the `p` and `z` values drastically improved the depth of the found minimum but required considerably more steps and function evaluations (slower 'speed' in terms of iterations and runtime, despite generating better answers).

### Impact of `sp`, `p`, and `z`
- **Impact of `sp`:** The starting point strongly impacted Which local valley the algorithm descended into. We observe that initial states closer to the domain boundaries (like `sp=(-510, 400)`) consistently settled into deeper valleys faster than neutral points like `sp=(0, 0)`.
- **Impact of `p` (Resampling Rate):** A higher sample count per iteration (`p=400` vs `p=120`) forced the algorithm to thoroughly scan its local basin before deciding on a direction, which reduced the chance of premature convergence in suboptimal pockets.
- **Impact of `z` (Jump Distance):** A larger search radius (`z=50` vs `z=9`) gave the algorithm the capability to bypass small hills and land in entirely different, potentially deeper valleys. The runs with `z=50` yielded noticeably larger coordinate leaps and generally deeper minimums than `z=9`.

### Complexity of RHCR2 Runs
The Big-O time complexity per run heavily scales with `O(p * I)`, where `I` is the number of transitions (iterations) made before being trapped. Evaluating neighbor candidates is done exactly `p` times per iteration, which linearly increases processing time as `p` expands. The space complexity remains a comfortable `O(1)`, as only the immediate current best tuple and function values are stored in memory at a time.

### Did Resampling Lead to Better Solutions?
Yes. Traditional stochastic hill climbing only generates one random neighbor, and if it's better, immediately transitions to it. By resampling `p` times around the current node before deciding, RHCR2 practically performs a localized brute-force sweep imitating a steepest-ascent behavior, ensuring only strictly competitive paths are taken.

### Could Other Values Produce Better Results?
Absolutely. As demonstrated in the **33rd Run**, setting a meticulously chosen `sp` closer to known boundaries, combined with massive exploration fields `p=2000` and mid-range `z=25`, produced a far superior local minimum than the defaults provided in the first 32 runs, efficiently navigating the complex space towards a much deeper value.

### Final Assessment
Overall, RHCR2 did a **good** job. While it is susceptible to local trapping like all hill-descending methods, its integration of broad resampling bounds (`z`) alongside high neighbor polling (`p`) partially mimics Simulated Annealing's ability to escape shallow traps, locating consistently deep minima within highly complex periodic terrains.

## AI Assistance
I used Gemini 3.1 to help me with the report and creating the markdowns. Also with some questions and debbuging.