
import type {
    ErrorRequestHandler
} from 'express';

export const errorMiddleware: ErrorRequestHandler = (
    error,
    req,
    res,
    next
) => {

    console.error(error);

    // PostgreSQL duplicate key
    if (error.code === '23505') {

        res.status(409).json({
            success: false,
            message: 'Data sudah terdaftar atau duplikat'
        });

        return;
    }

    // PostgreSQL invalid UUID
    if (error.code === '22P02') {

        res.status(400).json({
            success: false,
            message: 'Format data tidak valid'
        });

        return;
    }

    // PostgreSQL not null violation
    if (error.code === '23502') {

        res.status(400).json({
            success: false,
            message: 'Kolom wajib tidak boleh kosong'
        });

        return;
    }

    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
    });
    
};