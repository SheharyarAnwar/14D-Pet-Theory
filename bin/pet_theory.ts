#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PetTheoryStack } from '../lib/pet_theory-stack';

const app = new cdk.App();
new PetTheoryStack(app, 'PetTheoryStack');
