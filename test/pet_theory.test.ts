import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as PetTheory from '../lib/pet_theory-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new PetTheory.PetTheoryStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
