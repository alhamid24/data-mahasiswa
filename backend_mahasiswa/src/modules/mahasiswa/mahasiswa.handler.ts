
import type {
    RequestHandler
} from 'express';

import { z } from 'zod';

import { MahasiswaUseCase } from './mahasiswa.usecase.js';

import {
    createMahasiswaSchema,
    updateMahasiswaSchema,
    filterMahasiswaSchema
} from './mahasiswa.validation.js';

export class MahasiswaHandler {

    constructor(
        private readonly mahasiswaUseCase: MahasiswaUseCase
    ) {}

    // CREATE: Menambahkan mahasiswa
    create: RequestHandler = async (req, res, next) => {

        try {

            const validation = createMahasiswaSchema.safeParse(
                req.body
            );

            if (!validation.success) {

                res.status(400).json({
                    success: false,
                    message: 'Validasi data gagal',
                    errors: validation.error.flatten()
                });

                return;
            }

            const result = await this.mahasiswaUseCase.create(
                validation.data
            );

            res.status(201).json({

                success: true,
                message: 'Data mahasiswa berhasil ditambahkan',
                data: result

            });

        } catch (error) {

            next(error);

        }

    };

    // READ: Mengambil mahasiswa berdasarkan UUID
    getById: RequestHandler = async (req, res, next) => {

        try {

            const validation = z.string().uuid().safeParse(
                req.params.id
            );

            if (!validation.success) {

                res.status(400).json({
                    success: false,
                    message: 'Format UUID tidak valid'
                });

                return;
            }

            const result = await this.mahasiswaUseCase.getById(
                validation.data
            );

            if (!result) {

                res.status(404).json({
                    success: false,
                    message: 'Data mahasiswa tidak ditemukan'
                });

                return;
            }

            res.status(200).json({

                success: true,
                message: 'Data mahasiswa berhasil ditemukan',
                data: result

            });

        } catch (error) {

            next(error);

        }

    };

    // READ ALL: Mengambil seluruh mahasiswa
    getAll: RequestHandler = async (req, res, next) => {

        try {

            const page = Number(req.query.page ?? 1);
            const limit = Number(req.query.limit ?? 10);

            if (
                !Number.isInteger(page) ||
                !Number.isInteger(limit) ||
                page < 1 ||
                limit < 1
            ) {

                res.status(400).json({
                    success: false,
                    message: 'Page dan limit harus berupa bilangan bulat positif'
                });

                return;
            }

            const result = await this.mahasiswaUseCase.getAll(
                page,
                limit
            );

            res.status(200).json({

                success: true,
                message: 'Data mahasiswa berhasil diambil',
                ...result

            });

        } catch (error) {

            next(error);

        }

    };


    // FILTER: Mengambil mahasiswa berdasarkan prodi dan semester
    getByProdiAndSemester: RequestHandler = async (req, res, next) => {

        try {

            const filterValidation = filterMahasiswaSchema.safeParse({
                prodi: req.query.prodi,
                semester: req.query.semester
            });

            if (!filterValidation.success) {

                res.status(400).json({
                    success: false,
                    message: 'Filter program studi atau semester tidak valid',
                    errors: filterValidation.error.flatten()
                });

                return;
            }

            const page = Number(req.query.page ?? 1);
            const limit = Number(req.query.limit ?? 10);

            if (
                !Number.isInteger(page) ||
                !Number.isInteger(limit) ||
                page < 1 ||
                limit < 1
            ) {

                res.status(400).json({
                    success: false,
                    message: 'Page dan limit harus berupa bilangan bulat positif'
                });

                return;
            }

            const result = await this.mahasiswaUseCase.getByProdiAndSemester(
                filterValidation.data.prodi,
                filterValidation.data.semester,
                page,
                limit
            );

            res.status(200).json({
                success: true,
                message: 'Data mahasiswa berhasil difilter',
                ...result
            });

        } catch (error) {

            next(error);

        }

    };


    // UPDATE: Memperbarui data mahasiswa
    update: RequestHandler = async (req, res, next) => {

        try {

            const idValidation = z.string().uuid().safeParse(
                req.params.id
            );

            if (!idValidation.success) {

                res.status(400).json({
                    success: false,
                    message: 'Format UUID tidak valid'
                });

                return;
            }

            const validation = updateMahasiswaSchema.safeParse(
                req.body
            );

            if (!validation.success) {

                res.status(400).json({
                    success: false,
                    message: 'Validasi data gagal',
                    errors: validation.error.flatten()
                });

                return;
            }

            const result = await this.mahasiswaUseCase.update(
                idValidation.data,
                validation.data
            );

            if (!result) {

                res.status(404).json({
                    success: false,
                    message: 'Data mahasiswa tidak ditemukan'
                });

                return;
            }

            res.status(200).json({

                success: true,
                message: 'Data mahasiswa berhasil diperbarui',
                data: result

            });

        } catch (error) {

            next(error);

        }

    };

    // DELETE: Menghapus mahasiswa
    delete: RequestHandler = async (req, res, next) => {

        try {

            const validation = z.string().uuid().safeParse(
                req.params.id
            );

            if (!validation.success) {

                res.status(400).json({
                    success: false,
                    message: 'Format UUID tidak valid'
                });

                return;
            }

            const result = await this.mahasiswaUseCase.delete(
                validation.data
            );

            if (!result) {

                res.status(404).json({
                    success: false,
                    message: 'Data mahasiswa tidak ditemukan'
                });

                return;
            }

            res.status(200).json({

                success: true,
                message: 'Data mahasiswa berhasil dihapus'

            });

        } catch (error) {

            next(error);

        }

    };

}