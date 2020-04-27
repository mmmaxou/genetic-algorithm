import {Chromosome} from '../Chromosome';
import {BitChain} from '../Helpers/BitChain';
import {Population} from '../Population';
import {SelectionStatistics, SelectionStrategy} from './SelectionGeneric';

/**
 * https://arxiv.org/pdf/1109.3627.pdf
 * Article about roulette wheel theory
 */
export class RouletteWheelSelection<
  EncodedType = BitChain
> extends SelectionStrategy<EncodedType> {
  public selection(
    pop: Population<EncodedType>,
    statistics?: SelectionStatistics
  ): EncodedType[] {
    /**
     * Init
     */
    const fitnessMax = pop.fittest.normalizedFitnessScore;
    // const fitnessMin = pop.leastFit.normalizedFitnessScore;
    // console.log('fitness max is ', fitnessMax);
    // console.log('fitness min is ', fitnessMin);
    const selected: EncodedType[] = [];
    const averageIteration = pop.population.length * 3;
    let ctr = 0;

    /**
     * Loop
     */
    while (
      ctr < averageIteration * 10 &&
      selected.length < pop.config.population.popsize
    ) {
      ctr++;

      /**
       * 1.
       * Select randomly one of the individuals (say,i).
       * The selection is done with uniform probability (1/N),
       * which does not depend on the individual’s fitness
       */
      const i = Math.round(Math.random() * (pop.population.length - 1));
      const individual: Chromosome<EncodedType> = pop.population[i];

      /**
       * 2.
       * With  probability wi/wmax,
       * where wmax = max { wi } Ni = 1 is the maximal fitness in the population,
       * the selection is accepted.
       * Otherwise, the procedure is repeated from step 1
       * (i.e., in the case of rejection, another selection attempt is made)
       */
      const rng = Math.random();
      const p = individual.normalizedFitnessScore / fitnessMax;
      const accepted = p >= rng;
      if (accepted) {
        selected.push(individual.cloneChain());
      }
    }

    /// Add counter to statistics
    if (statistics) {
      statistics.iterations = ctr;
    }

    /// Return the selected bitchains
    return selected;
  }
}
