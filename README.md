# -randomized-hill-climbing-algorithm-with-resampling

# RHCR2 - Randomized Hill Climbing with Resampling

## Description
This project implements the Randomized Hill Climbing with Resampling (RHCR2) algorithm for minimizing a complex continuous function (`f_Frog`) over the domain `[-512, 512]` for variables `x` and `y`.

## Files Included
- `rhcr2.py`: The main Python source code implementing the f_Frog function, the RHCR2 optimization procedure, and the experimental runner.
- `README.md`: These program instructions.
- `Report.md`: A draft of the report containing tables, the random seed, conclusions, and a detailed summary of the 33rd run.

## Prerequisites
- Python 3.x installed.
- No external non-standard dependencies are required (relies only on Python's built-in `math` and `random` packages).

## Execution Instructions
To run the optimization experiments and regenerate the output tables:

1. Open your terminal or command prompt.
2. Navigate to the directory containing `rhcr2.py`.
3. Run the script using Python:
   ```bash
   python3 rhcr2.py
   ```
4. The script will output its progress to the standard console and save the output tables into two files:
   - `results_tables.txt`: Contains the 4 tables covering 50 runs of 4 different parameter combinations.
   - `run_33_summary.txt`: Contains the step-by-step trace of the 33rd execution run.

## Parameters
The script is configured with `random.seed(42)` to ensure identical reproducible results. Modify the `configs` list in the `run_experiments` function to test different combinations of neighbors (`p`) and neighborhood sizes (`z`).
