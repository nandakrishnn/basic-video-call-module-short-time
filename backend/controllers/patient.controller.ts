import type { Request, Response } from 'express'
import { MESSAGES } from '../constants/messages'
import { createPatient, findUsersByRole } from '../models/user.model'
import { syncPatientToPhysioPlatform } from '../services/physioPlatformSync.service'
import type { CreatePatientInput } from '../types/user.types'
import { successResponse } from '../utils/response'

export const listPatients = async (_req: Request, res: Response): Promise<void> => {
  const patients = await findUsersByRole('patient')
  res.status(200).json(successResponse(patients, MESSAGES.patient.listSuccess))
}

export const createPatientHandler = async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, phone } = req.body as CreatePatientInput
  const patient = await createPatient({ fullName, email, phone })

  try {
    await syncPatientToPhysioPlatform(patient)
  } catch (err) {
    // The patient is already created here - a failed mirror shouldn't fail the request.
    console.error('Failed to sync patient to physio-platform:', err)
  }

  res.status(201).json(successResponse(patient, MESSAGES.patient.createSuccess))
}
