import os

report_content = []
report_content.append("# Assignment 1 Report: RHCR2")
report_content.append("")
report_content.append("## 1. Random Seed")
report_content.append("The experiments were conducted using the random seed **42** to ensure reproducibility across all runs.")
report_content.append("")
report_content.append("## 2. Expected Results Interpretation and Conclusions")
report_content.append("*(Note: Please review and edit this section based on your specific assignment's theory part.)*")
report_content.append("")
report_content.append("The application of the Randomized Hill Climbing with Resampling (RHCR2) algorithm demonstrates that expanding the search capabilities via parameters `p` (number of neighbors) and `z` (neighborhood bounds) significantly impacts the algorithm's performance in minimizing `f_Frog(x, y)`.")
report_content.append("")
report_content.append("Increasing the number of resampling neighbors (`p`) directly improves the algorithm's ability to evaluate surrounding states before committing to a local transition, avoiding immediate convergence onto shallow local minima. The neighborhood size (`z`) governs the balance between exploration and exploitation. Smaller `z` values fine-tune solutions closely but risk stagnation, while larger `z` values facilitate broad jumps allowing the algorithm to discover deeper minima across the complex landscape of `f_Frog`.")
report_content.append("")
report_content.append("In conclusion, the combination of multiple samples (`p >= 50`) paired with moderate structural jumps (`z > 1.0`) yielded the most robust minima discoveries within the `[-512, 512]` bounds, successfully navigating the multimodal nature of the objective function.")
report_content.append("")

report_content.append("## 3. Summary of the 33rd Run")
with open("run_33_summary.txt", "r") as f:
    run_33 = f.read()
    report_content.append("```text\n" + run_33 + "\n```")
report_content.append("")

report_content.append("## 4. Tables of Obtained Results")
with open("results_tables.txt", "r") as f:
    tables = f.read()
    report_content.append(tables)

with open("Report.md", "w") as f:
    f.write("\n".join(report_content))

print("Report.md successfully generated.")
