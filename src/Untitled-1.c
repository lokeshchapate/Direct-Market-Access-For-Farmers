/* dna_crypto_demo.c
   Simple demo of text -> XOR-encrypt -> DNA mapping -> block checksum -> decode
   Compile: gcc -std=c11 -O2 dna_crypto_demo.c -o dna_crypto_demo
   Run: ./dna_crypto_demo
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define BLOCK_BYTES 8 /* number of data bytes per block before checksum */
#define MAX_INPUT 1024

/* Map 2 bits -> nucleotide */
char bits_to_nt(unsigned char two_bits)
{
    /* 00 -> A, 01 -> C, 10 -> G, 11 -> T */
    two_bits &= 0x03;
    switch (two_bits)
    {
    case 0:
        return 'A';
    case 1:
        return 'C';
    case 2:
        return 'G';
    default:
        return 'T';
    }
}

/* Map nucleotide -> 2 bits */
unsigned char nt_to_bits(char nt)
{
    switch (nt)
    {
    case 'A':
    case 'a':
        return 0x00;
    case 'C':
    case 'c':
        return 0x01;
    case 'G':
    case 'g':
        return 0x02;
    default:
        return 0x03; /* T or anything else -> 11 */
    }
}

/* Simple XOR "encryption" of data in-place with repeating key */
void xor_encrypt(unsigned char *data, size_t n, const unsigned char *key, size_t klen)
{
    if (klen == 0)
        return;
    for (size_t i = 0; i < n; i++)
        data[i] ^= key[i % klen];
}

/* Convert bytes to DNA string (each byte -> 4 nucleotides) */
char *bytes_to_dna(const unsigned char *data, size_t nbytes)
{
    size_t dna_len = nbytes * 4;
    char *dna = malloc(dna_len + 1);
    if (!dna)
        return NULL;
    size_t pos = 0;
    for (size_t i = 0; i < nbytes; i++)
    {
        unsigned char b = data[i];
        /* process most-significant bits first: bits 7-6, 5-4, 3-2, 1-0 */
        for (int shift = 6; shift >= 0; shift -= 2)
        {
            unsigned char two = (b >> shift) & 0x03;
            dna[pos++] = bits_to_nt(two);
        }
    }
    dna[pos] = '\0';
    return dna;
}

/* Convert DNA string back to bytes (expects length multiple of 4) */
unsigned char *dna_to_bytes(const char *dna, size_t *out_nbytes)
{
    size_t dna_len = strlen(dna);
    if (dna_len % 4 != 0)
        return NULL;
    size_t nbytes = dna_len / 4;
    unsigned char *out = malloc(nbytes);
    if (!out)
        return NULL;
    for (size_t i = 0; i < nbytes; i++)
    {
        unsigned char b = 0;
        for (int j = 0; j < 4; j++)
        {
            unsigned char two = nt_to_bits(dna[i * 4 + j]) & 0x03;
            b = (b << 2) | two;
        }
        out[i] = b;
    }
    *out_nbytes = nbytes;
    return out;
}

/* Append per-block XOR checksum: input bytes -> output bytes with checksum after each block */
unsigned char *append_block_checksums(const unsigned char *data, size_t nbytes, size_t *out_len)
{
    size_t blocks = (nbytes + BLOCK_BYTES - 1) / BLOCK_BYTES;
    size_t total = nbytes + blocks; /* add one checksum byte per block */
    unsigned char *out = malloc(total);
    if (!out)
        return NULL;
    size_t inpos = 0, outpos = 0;
    for (size_t b = 0; b < blocks; b++)
    {
        unsigned char checksum = 0;
        for (size_t i = 0; i < BLOCK_BYTES && inpos < nbytes; i++)
        {
            unsigned char v = data[inpos++];
            out[outpos++] = v;
            checksum ^= v;
        }
        /* if last block is short, still append checksum */
        out[outpos++] = checksum;
    }
    *out_len = total;
    return out;
}

/* Remove checksums and validate: returns NULL if any checksum mismatch; out_nbytes set to data length */
unsigned char *validate_and_strip_checksums(const unsigned char *data, size_t nbytes_with_checks, size_t *out_nbytes)
{
    size_t block_record = BLOCK_BYTES + 1;
    if (nbytes_with_checks % block_record == 0 || ((nbytes_with_checks / block_record) * block_record + (nbytes_with_checks % block_record)) == nbytes_with_checks)
    {
        /* proceed */
    }
    /* Compute number of blocks: iterate and validate */
    unsigned char *outbuf = malloc(nbytes_with_checks); /* upper bound */
    if (!outbuf)
        return NULL;
    size_t inpos = 0, outpos = 0;
    int error = 0;
    while (inpos < nbytes_with_checks)
    {
        unsigned char checksum = 0;
        size_t i;
        for (i = 0; i < BLOCK_BYTES && (inpos + i) < nbytes_with_checks - 0; i++)
        {
            /* stop early if next byte is the checksum position? We detect by position below */
            if (inpos + i + 1 >= nbytes_with_checks)
                break;
            /* But we can't determine block end except by counting up to BLOCK_BYTES or reaching checksum byte.
               We assume the format produced by append_block_checksums. */
            unsigned char v = data[inpos + i];
            checksum ^= v;
            outbuf[outpos++] = v;
        }
        inpos += i;
        if (inpos >= nbytes_with_checks)
        {
            error = 1;
            break;
        } /* missing checksum */
        unsigned char stored = data[inpos++];
        if (stored != checksum)
        {
            error = 1;
            break;
        }
    }
    if (error)
    {
        free(outbuf);
        return NULL;
    }
    *out_nbytes = outpos;
    return outbuf;
}

/* Helper: simulate a single random nucleotide error inside dna string for block index (0-based) */
void simulate_error_in_block(char *dna, size_t dna_len, size_t block_index, size_t dna_per_block)
{
    if (dna_per_block == 0)
        return;
    size_t start = block_index * dna_per_block;
    if (start >= dna_len)
        return;
    size_t pos = start + (rand() % dna_per_block);
    char orig = dna[pos];
    char choices[3];
    int c = 0;
    const char nt[4] = {'A', 'C', 'G', 'T'};
    for (int i = 0; i < 4; i++)
        if (nt[i] != orig)
            choices[c++] = nt[i];
    dna[pos] = choices[rand() % 3];
}

int main(void)
{
    char input[MAX_INPUT];
    printf("Enter plaintext (max %d chars): ", MAX_INPUT - 1);
    if (!fgets(input, sizeof(input), stdin))
        return 0;
    size_t linelen = strlen(input);
    if (linelen > 0 && input[linelen - 1] == '\n')
    {
        input[--linelen] = '\0';
    }

    /* Simple key for XOR (demo). Change as desired. */
    unsigned char key[] = {0x5A, 0xA5};
    size_t keylen = sizeof(key);

    /* Copy input into bytes */
    unsigned char *inbytes = (unsigned char *)strdup(input);
    size_t inlen = strlen((char *)inbytes);

    /* Encrypt (XOR) - optional; comment out to disable */
    xor_encrypt(inbytes, inlen, key, keylen);

    /* Append checksums per block */
    size_t with_checks_len = 0;
    unsigned char *with_checks = append_block_checksums(inbytes, inlen, &with_checks_len);

    /* Convert to DNA */
    char *dna = bytes_to_dna(with_checks, with_checks_len);
    printf("\n=== DNA-encoded payload ===\n%s\n", dna);

    /* Simulate corruption in one block (optional demo) */
    srand((unsigned)time(NULL));
    size_t bytes_per_block = BLOCK_BYTES + 1;                            /* data + checksum -> bytes in encoded stream */
    size_t dna_per_block = bytes_per_block * 4;                          /* 4 nucleotides per byte */
    size_t blocks = (with_checks_len + BLOCK_BYTES) / (BLOCK_BYTES + 1); /* approx */
    if (blocks > 0)
    {
        size_t corrupt_block = rand() % blocks;
        simulate_error_in_block(dna, strlen(dna), corrupt_block, dna_per_block);
        printf("\n(simulated an error in block %zu)\n", corrupt_block);
        printf("=== DNA after simulated error ===\n%s\n", dna);
    }

    /* Receiver: convert DNA back to bytes */
    size_t decoded_bytes_len = 0;
    unsigned char *decoded_with_checks = dna_to_bytes(dna, &decoded_bytes_len);
    if (!decoded_with_checks)
    {
        printf("Decoding failed (dna->bytes)\n");
        goto cleanup;
    }

    /* Validate checksums and strip */
    size_t stripped_len = 0;
    unsigned char *stripped = validate_and_strip_checksums(decoded_with_checks, decoded_bytes_len, &stripped_len);
    if (!stripped)
    {
        printf("\nChecksum validation FAILED — data corrupted or wrong format.\n");
        goto cleanup;
    }

    /* Decrypt (XOR) */
    xor_encrypt(stripped, stripped_len, key, keylen);

    /* Print recovered plaintext */
    printf("\nRecovered plaintext (%zu bytes):\n%.*s\n", stripped_len, (int)stripped_len, stripped);

cleanup:
    free(inbytes);
    free(with_checks);
    free(dna);
    /* decoded_with_checks and stripped may be NULL or allocated */
    /* best-effort free */
    /* In quick demo, we intentionally don't free all null checks for clarity. */

    return 0;
}
