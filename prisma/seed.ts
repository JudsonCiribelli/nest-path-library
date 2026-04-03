import { PrismaClient } from '@prisma/client';

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { config } from 'dotenv';

config();

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

const adapter = new PrismaBetterSqlite3({ url: dbUrl });

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.review.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();

  console.log('🧹 Banco de dados limpo!');

  const catFantasia = await prisma.category.create({
    data: { name: 'Fantasia' },
  });
  const catFiccao = await prisma.category.create({
    data: { name: 'Ficção Científica' },
  });
  const catTech = await prisma.category.create({
    data: { name: 'Tecnologia & Programação' },
  });
  const catMisterio = await prisma.category.create({
    data: { name: 'Mistério & Suspense' },
  });
  const catDistopia = await prisma.category.create({
    data: { name: 'Ficção Distópica' },
  });

  console.log('📚 Categorias criadas!');

  const tolkien = await prisma.author.create({
    data: {
      name: 'J.R.R. Tolkien',
      bio: 'Mestre da fantasia épica, linguista brilhante e criador do inigualável universo da Terra Média.',
    },
  });
  const asimov = await prisma.author.create({
    data: {
      name: 'Isaac Asimov',
      bio: 'Pilar da ficção científica mundial, introduziu os conceitos fundamentais de robótica e impérios intergalácticos.',
    },
  });
  const uncleBob = await prisma.author.create({
    data: {
      name: 'Robert C. Martin',
      bio: 'Referência mundial em engenharia de software, focado na criação de código sustentável e arquiteturas robustas.',
    },
  });
  const agatha = await prisma.author.create({
    data: {
      name: 'Agatha Christie',
      bio: 'Conhecida mundialmente como a Rainha do Crime, é a romancista mais vendida de todos os tempos.',
    },
  });
  const orwell = await prisma.author.create({
    data: {
      name: 'George Orwell',
      bio: 'Jornalista e escritor visionário, famoso por suas críticas sociais afiadas e narrativas sobre sistemas totalitários.',
    },
  });

  console.log('✍️ Autores criados!');

  // Livros com descrições imersivas
  const booksData = [
    // Tolkien (Fantasia)
    {
      title: 'A Sociedade do Anel',
      description:
        'Em uma pacata vila do Condado, o jovem Frodo Bolseiro herda um anel de poder incomensurável. Para evitar que a escuridão engula a Terra Média, ele deve embarcar em uma jornada épica ao lado de magos, elfos, anões e homens rumo à perigosa Montanha da Perdição.',
      pages: 423,
      year: 1954,
      authorId: tolkien.id,
      categoryId: catFantasia.id,
    },
    {
      title: 'As Duas Torres',
      description:
        'A Sociedade está desfeita, mas a missão não terminou. Enquanto Frodo e Sam se aventuram pelas terras sombrias de Mordor guiados pelo traiçoeiro Gollum, os outros membros lutam para defender o reino de Rohan contra as forças crescentes de Saruman.',
      pages: 352,
      year: 1954,
      authorId: tolkien.id,
      categoryId: catFantasia.id,
    },
    {
      title: 'O Retorno do Rei',
      description:
        'O poder de Sauron cresce a cada dia e a batalha final pela Terra Média se aproxima de Minas Tirith. Homens, elfos e anões devem se unir em um último esforço desesperado, enquanto o portador do anel enfrenta o teste definitivo de sua força de vontade.',
      pages: 416,
      year: 1955,
      authorId: tolkien.id,
      categoryId: catFantasia.id,
    },
    {
      title: 'O Hobbit',
      description:
        'Bilbo Bolseiro levava uma vida extremamente tranquila e previsível, até que o mago Gandalf e uma companhia de treze anões batem à sua porta. Ele é convidado a participar de uma caça a um tesouro guardado pelo terrível dragão Smaug.',
      pages: 310,
      year: 1937,
      authorId: tolkien.id,
      categoryId: catFantasia.id,
    },

    // Asimov (Ficção Científica)
    {
      title: 'Fundação',
      description:
        'O colossal Império Galáctico está prestes a ruir. Hari Seldon, o brilhante criador da psico-história, prevê milênios de trevas e caos. Para salvar o conhecimento da humanidade e encurtar a era de barbárie, ele estabelece a misteriosa Fundação.',
      pages: 255,
      year: 1951,
      authorId: asimov.id,
      categoryId: catFiccao.id,
    },
    {
      title: 'Fundação e Império',
      description:
        'A Primeira Fundação superou as sucessivas crises previstas por Seldon e prosperou na periferia da galáxia. Contudo, ela agora enfrenta o que resta do Império e, pior ainda, o surgimento de um mutante imprevisível com poderes devastadores.',
      pages: 247,
      year: 1952,
      authorId: asimov.id,
      categoryId: catFiccao.id,
    },
    {
      title: 'Segunda Fundação',
      description:
        'Enquanto o misterioso Mulo domina a galáxia com suas habilidades mentais, a única esperança de restaurar o plano de Seldon recai sobre a lendária Segunda Fundação. Uma caçada implacável e um jogo de xadrez em escala galáctica começam.',
      pages: 210,
      year: 1953,
      authorId: asimov.id,
      categoryId: catFiccao.id,
    },
    {
      title: 'Eu, Robô',
      description:
        'Através dos olhos da experiente Dra. Susan Calvin, explore a evolução da robótica e os complexos dilemas morais causados pelas infalíveis Três Leis da Robótica. Um mergulho profundo na psicologia de máquinas que pensam.',
      pages: 253,
      year: 1950,
      authorId: asimov.id,
      categoryId: catFiccao.id,
    },

    {
      title: 'Código Limpo',
      description:
        'Mesmo que um código ruim funcione, se ele não for limpo, pode derrubar uma empresa inteira de desenvolvimento. Aprenda a diferença definitiva entre código bom e ruim através de princípios práticos, regras de formatação e refatoração.',
      pages: 464,
      year: 2008,
      authorId: uncleBob.id,
      categoryId: catTech.id,
    },
    {
      title: 'Arquitetura Limpa',
      description:
        'Descubra as regras universais de arquitetura de software para aumentar dramaticamente a produtividade dos desenvolvedores ao longo de todo o ciclo de vida do software, separando detalhes de implementação das regras de negócio essenciais.',
      pages: 432,
      year: 2017,
      authorId: uncleBob.id,
      categoryId: catTech.id,
    },
    {
      title: 'O Codificador Limpo',
      description:
        'O verdadeiro profissionalismo no desenvolvimento de software vai muito além de apenas escrever um código que compila. Este livro aborda como lidar com conflitos, prazos apertados, estimativas reais e a atitude mental de um desenvolvedor de elite.',
      pages: 256,
      year: 2011,
      authorId: uncleBob.id,
      categoryId: catTech.id,
    },
    {
      title: 'Desenvolvimento Ágil Limpo',
      description:
        'O movimento Ágil se perdeu em meio a certificações superficiais e processos extremamente engessados. Uncle Bob resgata a essência verdadeira do manifesto ágil, explicando seus valores originais e como aplicá-los no dia a dia da equipe.',
      pages: 224,
      year: 2019,
      authorId: uncleBob.id,
      categoryId: catTech.id,
    },

    {
      title: 'E Não Sobrou Nenhum',
      description:
        'Dez pessoas que aparentemente não têm nada em comum são convidadas para uma luxuosa mansão em uma ilha isolada. Sem contato com o continente, elas começam a ser mortas uma a uma, seguindo os versos de uma antiga cantiga infantil.',
      pages: 272,
      year: 1939,
      authorId: agatha.id,
      categoryId: catMisterio.id,
    },
    {
      title: 'Assassinato no Expresso do Oriente',
      description:
        'Uma forte nevasca paralisa o trem mais famoso e luxuoso do mundo no meio da noite. Pela manhã, um passageiro é encontrado morto em sua cabine, trancada por dentro, com múltiplas facadas. O detetive Hercule Poirot precisa desvendar este quebra-cabeça.',
      pages: 256,
      year: 1934,
      authorId: agatha.id,
      categoryId: catMisterio.id,
    },
    {
      title: 'Morte no Nilo',
      description:
        'A serenidade de um cruzeiro de luxo navegando pelo imponente rio Nilo é destruída quando a jovem, rica e bela Linnet Ridgeway é encontrada assassinada. Uma teia de ciúmes, traição e ganância aguarda por Poirot sob o sol escaldante do Egito.',
      pages: 312,
      year: 1937,
      authorId: agatha.id,
      categoryId: catMisterio.id,
    },
    {
      title: 'O Assassinato de Roger Ackroyd',
      description:
        'Em um tranquilo e fofoqueiro vilarejo inglês, o homem mais rico da cidade é brutalmente apunhalado em seu escritório. O recém-aposentado Hercule Poirot é convencido a investigar um dos casos mais engenhosos e chocantes de sua brilhante carreira.',
      pages: 312,
      year: 1926,
      authorId: agatha.id,
      categoryId: catMisterio.id,
    },

    {
      title: '1984',
      description:
        'Winston Smith vive aprisionado sob o olhar onipresente do Grande Irmão. Em um mundo totalitário onde a verdade é distorcida e até o pensamento independente é considerado um crime mortal, ele ousa se apaixonar e questionar o sistema.',
      pages: 328,
      year: 1949,
      authorId: orwell.id,
      categoryId: catDistopia.id,
    },
    {
      title: 'A Revolução dos Bichos',
      description:
        'Cansados da exploração, os animais da Fazenda do Solar se rebelam, expulsam os humanos e tomam o poder. No entanto, os nobres ideais de igualdade e liberdade são gradualmente corrompidos, provando que o poder desenfreado sempre encontra um novo mestre.',
      pages: 112,
      year: 1945,
      authorId: orwell.id,
      categoryId: catDistopia.id,
    },
    {
      title: 'A Flor da Inglaterra',
      description:
        'Gordon Comstock, um poeta frustrado e idealista, declara uma guerra pessoal contra o dinheiro e a ganância. Ele tenta viver completamente fora do sistema capitalista em Londres, enfrentando a dura, cômica e muitas vezes trágica realidade da pobreza voluntária.',
      pages: 288,
      year: 1936,
      authorId: orwell.id,
      categoryId: catDistopia.id,
    },
    {
      title: 'Na Pior em Paris e Londres',
      description:
        'Um relato visceral, jornalístico e semiautobiográfico sobre a vida nos submundos e vielas da miséria europeia. Uma exposição crua das condições de trabalho extenuantes e da luta diária pela sobrevivência nas ruas implacáveis de duas das maiores capitais do mundo.',
      pages: 240,
      year: 1933,
      authorId: orwell.id,
      categoryId: catDistopia.id,
    },
  ];

  for (const book of booksData) {
    await prisma.book.create({ data: book });
  }

  console.log('🚀 Seed finalizado! O Front-end tem dados robustos agora.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
