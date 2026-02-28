import mongoose from 'mongoose';
import { ActorModel, IActor } from './actors.js';
import { ProducersModel, IProducers } from './producers.js';

/*🛠️ Requisits Tècnics
Una nova col·lecció enllaçada
CRUD de la nova col·lecció:
    create: Guarda.
    getById(id): Retorna amb el seu populate de la col·lecció enllaçada.
    update(id, data): Modifica les dades.
    delete(id): Elimina.
    listAll(): Llista tots els documents usant .lean().*/

async function runDemoSeminari() {
  try {

    await mongoose.connect('mongodb://127.0.0.1:27017/ea_seminari_mongoose');
    console.log('Connected to MongoDB');

    console.log('Cleaning database...');
    await ActorModel.deleteMany({});
    await ProducersModel.deleteMany({})

    // CREATE

    // TENIM 2 ORGANIZACIONS A LA BASE DE DADES
    const producers = await ProducersModel.insertMany([
      { name: 'Disney', country: 'USA' },
      { name: '20th Century Fox', country: 'USA' },
      { name: 'Universal Pictures', country: 'USA' },
      { name: 'Marvel Studios', country: 'USA' },
      { name: 'Pixar Animation Studios', country: 'USA' }
    ]);

    // TENIM  USUARIS A LA BASE DE DADES
    const actorsData = [
      {
        name: 'Tom Hanks',
        email: 'tomhanks@disney.com',
        role: 'ACTOR',
        famousFor: ['Forrest Gump', 'Cast Away', 'Saving Private Ryan'],
        organization: producers[0]._id
      },
      {
        name: 'Leonardo DiCaprio',
        email: 'leonardo@fox.com',
        role: 'ACTOR',
        famousFor: ['Titanic', 'Inception', 'The Revenant'],
        organization: producers[1]._id
      },
      {
        name: 'George Clooney',
        email: 'george@universal.com',
        role: 'ACTOR',
        famousFor: ['Ocean’s Eleven', 'Gravity', 'The Descendants'],
        organization: producers[2]._id
      },
      {
        name: 'Matt Damon',
        email: 'matt@universal.com',
        role: 'ACTOR',
        famousFor: ['The Martian', 'Good Will Hunting', 'The Bourne Identity'],
        organization: producers[2]._id
      },
      {
        name: 'Julia Roberts',
        email: 'julia@disney.com',
        role: 'ACTOR',
        famousFor: ['Pretty Woman', 'Erin Brockovich', 'Notting Hill'],
        organization: producers[0]._id
      },
      {
        name: 'Anne Hathaway',
        email: 'anne@fox.com',
        role: 'ACTOR',
        famousFor: ['Les Misérables', 'Interstellar', 'The Devil Wears Prada'],
        organization: producers[1]._id
      },
      {
        name: 'Robert Downey Jr.',
        email: 'rdj@marvel.com',
        role: 'ACTOR',
        famousFor: ['Iron Man', 'Avengers: Endgame', 'Sherlock Holmes'],
        organization: producers[3]._id
      },
      {
        name: 'Sylvester Stallone',
        email: 'stallone@universal.com',
        role: 'ACTOR',
        famousFor: ['Rocky', 'Rambo', 'The Expendables'],
        organization: producers[2]._id
      },
      {
        name: 'Robin Williams',
        email: 'robin@pixar.com',
        role: 'ACTOR',
        famousFor: ['Mrs. Doubtfire', 'Good Will Hunting', 'Aladdin'],
        organization: producers[4]._id
      },
      {
        name: 'Adam Sandler',
        email: 'adam@disney.com',
        role: 'ACTOR',
        famousFor: ['Happy Gilmore', 'The Mask', 'Uncut Gems'],
        organization: producers[0]._id
      }
    ];

    // CREAR I INSERIR A LA BASE DE DADES
    const actors = await ActorModel.insertMany(actorsData);
    console.log();
    console.log("CREATE");
    console.log(`Seeded ${actorsData.length} users and ${producers.length} organizations`);






    // GET BY ID
    const actor: IActor | null = await ActorModel.findById(actors[0]._id);
    console.log();
    console.log("GET BY ID");
    console.log(`User: ${actor?.name}`);






    // UPDATE  s'huaria aquí insertar el codi per fer un update del que es vulgui

    // UPDATE

    console.log(`Actor role: \`${actor?.role}`);

    await ActorModel.findByIdAndUpdate(actors[0]._id,{ role: 'DIRECTOR' });

    const updatedUser: IActor | null = await ActorModel.findById(actors[0]._id);
    console.log();
    console.log("UPDATE");
    console.log(`Updated actor: role: \`${updatedUser?.role}`);




    // POPULATE
    console.log();
    console.log('\n🔍 POPULATE:');

    const actorWithOrg = await ActorModel.findOne({ name: 'Tom Hanks' }).populate('organization').lean();

    const orgDetails = actorWithOrg?.organization as unknown as IProducers;

    console.log(actorWithOrg);
    console.log(`Works at: ${orgDetails?.name} (${orgDetails?.country})`);





    // DELETE
    const deletedUser = await ActorModel.findByIdAndDelete(actors[1]._id);
    console.log();
    console.log("DELETE");
    console.log('Deleted actor:', deletedUser);





    // LIST ALL
    const allUsers = await ActorModel.find().lean();
    console.log();
    console.log("LIST ALL");
    console.log('All users:', allUsers);


  }
  catch (err) {
    console.error('Error:', err);
  }
  finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

runDemoSeminari();

