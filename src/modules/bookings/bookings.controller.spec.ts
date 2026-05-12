import { BookingsController } from './bookings.controller';

describe('BookingsController', () => {
  const bookingsService = {
    create: jest.fn(),
    findMine: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    delete: jest.fn(),
    createPrescription: jest.fn(),
    submitDoctorReview: jest.fn(),
  };

  const controller = new BookingsController(bookingsService as never);
  const user = { id: 'u1', role: 'admin' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forwards create()', async () => {
    bookingsService.create.mockResolvedValue({ item: { id: 'b1' } });
    await expect(
      controller.create(user as never, { hospitalId: 'thb' } as never),
    ).resolves.toEqual({ item: { id: 'b1' } });
  });

  it('forwards findAll()', async () => {
    bookingsService.findAll.mockResolvedValue({ items: [] });
    await expect(controller.findAll(user as never)).resolves.toEqual({
      items: [],
    });
  });

  it('forwards the remaining controller methods', async () => {
    bookingsService.findMine.mockResolvedValue({ items: [] });
    bookingsService.findOne.mockResolvedValue({ item: { id: 'b1' } });
    bookingsService.update.mockResolvedValue({ item: { id: 'b1' } });
    bookingsService.delete.mockResolvedValue({ ok: true });
    bookingsService.createPrescription.mockResolvedValue({ item: { id: 'b1' } });
    bookingsService.submitDoctorReview.mockResolvedValue({
      item: { id: 'b1' },
    });

    await expect(controller.findMine(user as never)).resolves.toEqual({
      items: [],
    });
    await expect(controller.findOne('b1', user as never)).resolves.toEqual({
      item: { id: 'b1' },
    });
    await expect(
      controller.update('b1', user as never, { complaint: 'baru' } as never),
    ).resolves.toEqual({
      item: { id: 'b1' },
    });
    await expect(controller.remove('b1', user as never)).resolves.toEqual({
      ok: true,
    });
    await expect(
      controller.createPrescription('b1', user as never, {
        stage: 'STADIUM_1',
        items: ['Obat'],
        notes: '',
      } as never),
    ).resolves.toEqual({
      item: { id: 'b1' },
    });
    await expect(
      controller.submitDoctorReview('b1', user as never, {
        symptoms: 'Gejala',
      } as never),
    ).resolves.toEqual({
      item: { id: 'b1' },
    });
  });

  it('forwards updateStatus()', async () => {
    bookingsService.updateStatus.mockResolvedValue({ item: { id: 'b1' } });
    await expect(
      controller.updateStatus('b1', user as never, {
        status: 'CONFIRMED',
      } as never),
    ).resolves.toEqual({ item: { id: 'b1' } });
  });
});
